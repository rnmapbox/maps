//
//  RCTMapboxGL.m
//  RCTMapboxGL
//
//  Created by Bobby Sudekum on 4/30/15.
//  Copyright (c) 2015 Mapbox. All rights reserved.
//

#import "RCTMapboxGL.h"
#import "RCTBridgeModule.h"
#import "RCTEventDispatcher.h"
#import "UIView+React.h"
#import "RCTLog.h"
#import "RCTMapboxGLConversions.h"
#import "RCTMapboxAnnotation.h"

@implementation RCTMapboxGL {
    /* Required to publish events */
    RCTEventDispatcher *_eventDispatcher;

    /* Our map subview instance */
    MGLMapView *_map;

    /* Map properties */
    NSMutableDictionary *_annotations;
    CLLocationCoordinate2D _initialCenterCoordinate;
    double _initialDirection;
    double _initialZoomLevel;
    BOOL _zoomEnabled;
    double _minimumZoomLevel;
    double _maximumZoomLevel;
    BOOL _clipsToBounds;
    BOOL _debugActive;
    BOOL _finishedLoading;
    BOOL _rotateEnabled;
    BOOL _scrollEnabled;
    BOOL _pitchEnabled;
    BOOL _showsUserLocation;
    NSURL *_styleURL;
    int _userTrackingMode;
    BOOL _attributionButton;
    BOOL _logo;
    BOOL _compass;
    UIEdgeInsets _contentInset;
    MGLAnnotationVerticalAlignment _userLocationVerticalAlignment;
    /* So we don't fire onChangeUserTracking mode when triggered by props */
    BOOL _isChangingUserTracking;
    NSMutableDictionary<NSString *, UIView *> *_reactSubviews;
}

// View creation

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher
{
    if (self = [super init]) {
        _eventDispatcher = eventDispatcher;
        _clipsToBounds = YES;
        _finishedLoading = NO;
        _annotations = [NSMutableDictionary dictionary];
        _reactSubviews = [NSMutableDictionary dictionary];
    }

    return self;
}

- (void)createMapIfNeeded
{
    CGRect bounds = self.bounds;
    if (_map ||
        !_styleURL ||
        bounds.size.width <= 0 || bounds.size.height <= 0
    ) {
        return;
    }

    _map = [[MGLMapView alloc] initWithFrame:self.bounds];
    _map.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    _map.delegate = self;

    UILongPressGestureRecognizer *longPress = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(handleLongPress:)];
    [self addGestureRecognizer:longPress];

    UITapGestureRecognizer *singleTap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleSingleTap:)];
    singleTap.delegate = self;
    [_map addGestureRecognizer:singleTap];

    _map.centerCoordinate = _initialCenterCoordinate;
    _map.clipsToBounds = _clipsToBounds;
    _map.debugActive = _debugActive;
    _map.direction = _initialDirection;
    _map.rotateEnabled = _rotateEnabled;
    _map.scrollEnabled = _scrollEnabled;
    _map.zoomEnabled = _zoomEnabled;
    _map.pitchEnabled = _pitchEnabled;
    _map.minimumZoomLevel = _minimumZoomLevel;
    _map.maximumZoomLevel = _maximumZoomLevel;
    _map.showsUserLocation = _showsUserLocation;
    _map.styleURL = _styleURL;
    _map.zoomLevel = _initialZoomLevel;
    _map.contentInset = _contentInset;
    [_map.attributionButton setHidden:_attributionButton];
    [_map.logoView setHidden:_logo];
    [_map.compassView setHidden:_compass];
    _map.userLocationVerticalAlignment = _userLocationVerticalAlignment;
    _isChangingUserTracking = YES;
    _map.userTrackingMode = _userTrackingMode;
    _isChangingUserTracking = NO;
    for (NSString * annotationId in _annotations) {
        [_map addAnnotation:_annotations[annotationId]];
    }

    [self addSubview:_map];
    for (NSString *key in [_reactSubviews allKeys]) {
        [_map addAnnotation:_reactSubviews[key]];
    }
    
    [self layoutSubviews];
}

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer
{
    return YES;
}

- (void)layoutSubviews
{
    if (!_map) {
        [self createMapIfNeeded];
    }
    _map.frame = self.bounds;
    [_map layoutSubviews];
}

// React subviews for custom annotation management
- (void)insertReactSubview:(id<RCTComponent>)subview atIndex:(NSInteger)atIndex {
    // Our desired API is to pass up markers/overlays as children to the mapview component.
    // This is where we intercept them and do the appropriate underlying mapview action.
    if ([subview isKindOfClass:[RCTMapboxAnnotation class]]) {
        RCTMapboxAnnotation * annotation = (RCTMapboxAnnotation *) subview;
        annotation.map = self;
        [_map addAnnotation:annotation];
        NSString *key = annotation.reuseIdentifier;
        _reactSubviews[key] = annotation;
    }
}

- (void)removeReactSubview:(id<RCTComponent>)subview {
    // similarly, when the children are being removed we have to do the appropriate
    // underlying mapview action here.
    if ([subview isKindOfClass:[RCTMapboxAnnotation class]]) {
        RCTMapboxAnnotation * annotation = (RCTMapboxAnnotation *) subview;
        [_reactSubviews removeObjectForKey:annotation.reuseIdentifier];
    }
}

- (NSArray<id<RCTComponent>> *)reactSubviews {
    return nil;
}



// Annotation management

- (void)upsertAnnotation:(RCTMGLAnnotation *) annotation {
    NSString * identifier = [annotation id];
    if (!identifier || [identifier length] == 0) {
        RCTLogError(@"field `id` is required on all annotations");
        return;
    }

    RCTMGLAnnotation * oldAnnotation = [_annotations objectForKey:identifier];
    [_annotations setObject:annotation forKey:identifier];
    [_map addAnnotation:annotation];
    if (oldAnnotation) {
        [_map removeAnnotation:oldAnnotation];
    }
}

- (void)removeAnnotation:(NSString*)selectedIdentifier
{
    RCTMGLAnnotation * annotation = [_annotations objectForKey:selectedIdentifier];
    if (!annotation) { return; }
    [_map removeAnnotation:annotation];
    [_annotations removeObjectForKey:selectedIdentifier];
}

- (void)removeAllAnnotations
{
    [_map removeAnnotations:_map.annotations];
    [_annotations removeAllObjects];
}

- (void)deselectAnnotation
{
    NSArray * annotations = [_map selectedAnnotations];
    if (!annotations) { return; }
    for (id annotation in annotations) {
        [_map deselectAnnotation:annotation animated:YES];
    }
}

- (void)restoreAnnotationPosition:(NSString *)annotationId {
    if (_reactSubviews[annotationId] && [_reactSubviews[annotationId] isKindOfClass:[RCTMapboxAnnotation class]]){
        RCTMapboxAnnotation *annotation = (RCTMapboxAnnotation *)_reactSubviews[annotationId];
        CGPoint point = [_map convertCoordinate:annotation.coordinate toPointToView:_map];
        annotation.center = point;
    }
}
- (CGFloat)mapView:(MGLMapView *)mapView alphaForShapeAnnotation:(RCTMGLAnnotationPolyline *)shape
{
    if ([shape isKindOfClass:[RCTMGLAnnotationPolyline class]]) {
        return shape.strokeAlpha;
    } else if ([shape isKindOfClass:[RCTMGLAnnotationPolygon class]]) {
        return [(RCTMGLAnnotationPolygon *) shape fillAlpha];
    } else {
        return 1.0;
    }
}

- (UIColor *)mapView:(MGLMapView *)mapView strokeColorForShapeAnnotation:(RCTMGLAnnotationPolyline *)shape
{
    if ([shape isKindOfClass:[RCTMGLAnnotationPolyline class]]) {
        return [self getUIColorObjectFromHexString:shape.strokeColor alpha:1];
    } else if ([shape isKindOfClass:[RCTMGLAnnotationPolygon class]]) {
        return [self getUIColorObjectFromHexString:[(RCTMGLAnnotationPolygon *) shape strokeColor] alpha:1];
    } else {
        return [UIColor blueColor];
    }
}

- (CGFloat)mapView:(MGLMapView *)mapView lineWidthForPolylineAnnotation:(RCTMGLAnnotationPolyline *)shape
{
    return shape.strokeWidth;
}

- (UIColor *)mapView:(MGLMapView *)mapView fillColorForPolygonAnnotation:(RCTMGLAnnotationPolygon *)shape
{
    return [self getUIColorObjectFromHexString:shape.fillColor alpha:1];
}

- (BOOL)mapView:(RCTMapboxGL *)mapView annotationCanShowCallout:(id <MGLAnnotation>)annotation {
    if (!_annotationsPopUpEnabled) { return NO; }
    NSString *title = [(RCTMGLAnnotation *) annotation title];
    NSString *subtitle = [(RCTMGLAnnotation *) annotation subtitle];
    return ([title length] != 0 || [subtitle length] != 0);
}

- (nullable MGLAnnotationView *)mapView:(MGLMapView *)mapView viewForAnnotation:(id <MGLAnnotation>)annotation {
    if ([annotation isKindOfClass:[RCTMapboxAnnotation class]] ){
        RCTMapboxAnnotation *customAnnotation = (RCTMapboxAnnotation *)annotation;
        MGLAnnotationView *annotationView = [mapView dequeueReusableAnnotationViewWithIdentifier:customAnnotation.reuseIdentifier];
        if (!annotationView){
            annotationView = _reactSubviews[customAnnotation.reuseIdentifier];
        }
        return annotationView;
    }
    return nil;
}

- (UIButton *)mapView:(MGLMapView *)mapView rightCalloutAccessoryViewForAnnotation:(id <MGLAnnotation>)annotation;
{
    if ([annotation isKindOfClass:[RCTMGLAnnotation class]]) {
        UIButton *accessoryButton = [(RCTMGLAnnotation *) annotation rightCalloutAccessory];
        return accessoryButton;
    }
    return nil;
}

- (void)mapView:(MGLMapView *)mapView annotation:(id<MGLAnnotation>)annotation calloutAccessoryControlTapped:(UIControl *)control
{
    if (annotation.title && annotation.subtitle) {

        NSString *id = [(RCTMGLAnnotation *) annotation id];

        NSDictionary *event = @{ @"target": self.reactTag,
                                 @"src": @{ @"title": annotation.title,
                                            @"subtitle": annotation.subtitle,
                                            @"id": id,
                                            @"latitude": @(annotation.coordinate.latitude),
                                            @"longitude": @(annotation.coordinate.longitude)} };

        [_eventDispatcher sendInputEventWithName:@"onRightAnnotationTapped" body:event];
    }
}

- (MGLAnnotationImage *)mapView:(MGLMapView *)mapView imageForAnnotation:(id<MGLAnnotation>)annotation
{
    NSDictionary *source = [(RCTMGLAnnotation *) annotation annotationImageSource];
    if (!source) { return nil; }

    CGSize imageSize = [(RCTMGLAnnotation *) annotation annotationImageSize];
    NSString *reuseIdentifier = source[@"uri"];
    MGLAnnotationImage *annotationImage = [mapView dequeueReusableAnnotationImageWithIdentifier:reuseIdentifier];

    if (!annotationImage) {
        UIImage *image = imageFromSource(source);
        UIGraphicsBeginImageContextWithOptions(imageSize, NO, 0.0);
        [image drawInRect:CGRectMake(0, 0, imageSize.width, imageSize.height)];
        UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        annotationImage = [MGLAnnotationImage annotationImageWithImage:newImage reuseIdentifier:reuseIdentifier];
    }

    return annotationImage;
}

// React props

- (void)setInitialCenterCoordinate:(CLLocationCoordinate2D)centerCoordinate
{
    _initialCenterCoordinate = centerCoordinate;
}

- (void)setInitialZoomLevel:(double)zoomLevel
{
    _initialZoomLevel = zoomLevel;
}

- (void)setInitialDirection:(double)direction
{
    _initialDirection = direction;
}


- (void)setClipsToBounds:(BOOL)clipsToBounds
{
    if (_clipsToBounds == clipsToBounds) { return; }
    _clipsToBounds = clipsToBounds;
    if (_map) { _map.clipsToBounds = clipsToBounds; }
}

- (void)setDebugActive:(BOOL)debugActive
{
    if (_debugActive == debugActive) { return; }
    _debugActive = debugActive;
    if (_map) { _map.debugActive = debugActive; }
}

- (void)setRotateEnabled:(BOOL)rotateEnabled
{
    if (_rotateEnabled == rotateEnabled) { return; }
    _rotateEnabled = rotateEnabled;
    if (_map) { _map.rotateEnabled = rotateEnabled; }
}

- (void)setScrollEnabled:(BOOL)scrollEnabled
{
    if (_scrollEnabled == scrollEnabled) { return; }
    _scrollEnabled = scrollEnabled;
    if (_map) { _map.scrollEnabled = scrollEnabled; }
}

- (void)setZoomEnabled:(BOOL)zoomEnabled
{
    if (_zoomEnabled == zoomEnabled) { return; }
    _zoomEnabled = zoomEnabled;
    if (_map) { _map.zoomEnabled = zoomEnabled; }
}

- (void)setMinimumZoomLevel:(double)minimumZoomLevel
{
    if (_minimumZoomLevel == minimumZoomLevel) { return; }
    _minimumZoomLevel = minimumZoomLevel;
    if (_map) { _map.minimumZoomLevel = minimumZoomLevel; }
}

- (void)setMaximumZoomLevel:(double)maximumZoomLevel
{
    if (_maximumZoomLevel == maximumZoomLevel) { return; }
    _maximumZoomLevel = maximumZoomLevel;
    if (_map) { _map.maximumZoomLevel = maximumZoomLevel; }
}

- (void)setPitchEnabled:(BOOL)pitchEnabled
{
    if (_pitchEnabled == pitchEnabled) { return; }
    _pitchEnabled = pitchEnabled;
    if (_map) { _map.pitchEnabled = pitchEnabled; }
}

- (void)setShowsUserLocation:(BOOL)showsUserLocation
{
    if (_showsUserLocation == showsUserLocation) { return; }
    _showsUserLocation = showsUserLocation;
    if (_map) { _map.showsUserLocation = showsUserLocation; }
}

- (void)setStyleURL:(NSURL *)styleURL
{
    if (_styleURL && [styleURL isEqual:_styleURL]) { return; }
    _styleURL = styleURL;
    if (_map) {
        _map.styleURL = styleURL;
    } else {
        [self createMapIfNeeded];
    }
}

- (void)setUserTrackingMode:(int)userTrackingMode
{
    if (_userTrackingMode == userTrackingMode) { return; }
    if (userTrackingMode > 3 || userTrackingMode < 0) {
        _userTrackingMode = 0;
    } else {
        _userTrackingMode = userTrackingMode;
    }
    if (_map) {
        _isChangingUserTracking = YES;
        _map.userTrackingMode = _userTrackingMode;
        _isChangingUserTracking = NO;
    }
}

- (void)setAttributionButtonIsHidden:(BOOL)isHidden
{
    if (_attributionButton == isHidden) { return; }
    _attributionButton = isHidden;
    if (_map) { _map.attributionButton.hidden = isHidden; }
}

- (void)setLogoIsHidden:(BOOL)isHidden
{
    if (_logo == isHidden) { return; }
    _logo = isHidden;
    if (_map) { _map.logoView.hidden = isHidden; }
}

- (void)setCompassIsHidden:(BOOL)isHidden
{
    if (_compass == isHidden) { return; }
    _compass = isHidden;
    if (_map) { _map.compassView.hidden = isHidden; }
}

- (void)setContentInset:(UIEdgeInsets)inset
{
    _contentInset = inset;
    if (_map) { _map.contentInset = inset; }
}

- (void)setUserLocationVerticalAlignment:(MGLAnnotationVerticalAlignment)alignment
{
    if (_userLocationVerticalAlignment == alignment) { return; }
    _userLocationVerticalAlignment = alignment;
    if (_map) { _map.userLocationVerticalAlignment = alignment; }
}

// Getters

- (MGLCoordinateBounds) visibleCoordinateBounds
{
    return [_map visibleCoordinateBounds];
}

-(CLLocationCoordinate2D)centerCoordinate {
    if (!_map) { return _initialCenterCoordinate; }
    return _map.centerCoordinate;
}

-(double)direction {
    if (!_map) { return _initialDirection; }
    return _map.direction;
}

-(double)pitch {
    if (!_map) { return 0; }
    return _map.camera.pitch;
}

-(double)zoomLevel {
    if (!_map) { return _initialZoomLevel; }
    return _map.zoomLevel;
}

-(MGLMapCamera*)camera {
    if (!_map) { return nil; }
    return _map.camera;
}

// Imperative methods

- (void)setCenterCoordinate:(CLLocationCoordinate2D)coordinate zoomLevel:(double)zoomLevel direction:(double)direction animated:(BOOL)animated completionHandler:(void (^)())callback
{
    if (!_map) {
        _initialCenterCoordinate = coordinate;
        _initialZoomLevel = zoomLevel;
        _initialDirection = direction;
        callback();
        return;
    }
    [_map setCenterCoordinate:coordinate
                    zoomLevel:zoomLevel
                    direction:direction
                     animated:animated
            completionHandler:callback];
}

- (void)setCamera:(MGLMapCamera *)camera withDuration:(NSTimeInterval)duration animationTimingFunction:(nullable CAMediaTimingFunction *)function completionHandler:(nullable void (^)(void))handler
{
    [_map setCamera: camera withDuration:duration animationTimingFunction:function completionHandler:handler];
}

- (void)setVisibleCoordinateBounds:(MGLCoordinateBounds)bounds edgePadding:(UIEdgeInsets)padding animated:(BOOL)animated
{
    [_map setVisibleCoordinateBounds:bounds edgePadding:padding animated:animated];
}

- (void)selectAnnotation:(NSString*)selectedId animated:(BOOL)animated;
{
    RCTMGLAnnotation * annotation = [_annotations objectForKey:selectedId];
    if (!annotation) { return; }
    [_map selectAnnotation:annotation animated:animated];
}


// Events

-(void)mapView:(MGLMapView *)mapView didChangeUserTrackingMode:(MGLUserTrackingMode)mode animated:(BOOL)animated
{
    if (_isChangingUserTracking) { return; }
    if (!_onChangeUserTrackingMode) { return; }

    _onChangeUserTrackingMode(@{ @"target": self.reactTag,
                                 @"src": @(mode) });
}

- (void)mapView:(MGLMapView *)mapView didUpdateUserLocation:(MGLUserLocation *)userLocation;
{
    if (!_onUpdateUserLocation) { return; }
    _onUpdateUserLocation(@{ @"target": self.reactTag,
                             @"src": @{ @"latitude": @(userLocation.coordinate.latitude),
                                        @"longitude": @(userLocation.coordinate.longitude),
                                        @"verticalAccuracy": @(userLocation.location.verticalAccuracy),
                                        @"horizontalAccuracy": @(userLocation.location.horizontalAccuracy),
                                        @"headingAccuracy": @(userLocation.heading.headingAccuracy),
                                        @"magneticHeading": @(userLocation.heading.magneticHeading),
                                        @"trueHeading": @(userLocation.heading.trueHeading),
                                        @"isUpdating": [NSNumber numberWithBool:userLocation.isUpdating]} });
}

- (void)mapView:(MGLMapView *)mapView didFailToLocateUserWithError:(NSError *)error
{
    if (!_onLocateUserFailed) { return; }
    _onLocateUserFailed(@{ @"target": self.reactTag,
                             @"src": @{ @"message":  [error localizedDescription] } });
}

-(void)mapView:(MGLMapView *)mapView didSelectAnnotation:(id<MGLAnnotation>)annotation
{
    if (!annotation.title || !annotation.subtitle) { return; }
    if (!_onOpenAnnotation) { return; }
    _onOpenAnnotation(@{ @"target": self.reactTag,
                            @"src": @{ @"title": annotation.title,
                                       @"subtitle": annotation.subtitle,
                                       @"id": [(RCTMGLAnnotation *) annotation id],
                                       @"latitude": @(annotation.coordinate.latitude),
                                       @"longitude": @(annotation.coordinate.longitude)} });
}


- (void)mapView:(RCTMapboxGL *)mapView regionDidChangeAnimated:(BOOL)animated
{
    if (!_onRegionDidChange) { return; }

    CLLocationCoordinate2D region = _map.centerCoordinate;
    _onRegionDidChange(@{ @"target": self.reactTag,
                       @"src": @{ @"latitude": @(region.latitude),
                                  @"longitude": @(region.longitude),
                                  @"zoomLevel": @(_map.zoomLevel),
                                  @"direction": @(_map.direction),
                                  @"pitch": @(_map.camera.pitch),
                                  @"animated": @(animated) } });
}


- (void)mapView:(RCTMapboxGL *)mapView regionWillChangeAnimated:(BOOL)animated
{
    if (!_onRegionWillChange) { return; }

    CLLocationCoordinate2D region = _map.centerCoordinate;
    _onRegionWillChange(@{ @"target": self.reactTag,
                           @"src": @{ @"latitude": @(region.latitude),
                                      @"longitude": @(region.longitude),
                                      @"zoomLevel": @(_map.zoomLevel),
                                      @"direction": @(_map.direction),
                                      @"pitch": @(_map.camera.pitch),
                                      @"animated": @(animated) } });
}

- (void)handleSingleTap:(UITapGestureRecognizer *)sender
{
    if (!_onTap) { return; }

    CLLocationCoordinate2D location = [_map convertPoint:[sender locationInView:_map] toCoordinateFromView:_map];
    CGPoint screenCoord = [sender locationInView:_map];

    _onTap(@{ @"target": self.reactTag,
              @"src": @{ @"latitude": @(location.latitude),
                         @"longitude": @(location.longitude),
                         @"screenCoordY": @(screenCoord.y),
                         @"screenCoordX": @(screenCoord.x) } });
}

- (void)handleLongPress:(UITapGestureRecognizer *)sender
{
    if (!_onLongPress) { return; }
    if (sender.state != UIGestureRecognizerStateBegan) { return; }

    CLLocationCoordinate2D location = [_map convertPoint:[sender locationInView:_map] toCoordinateFromView:_map];
    CGPoint screenCoord = [sender locationInView:_map];

    _onLongPress(@{ @"target": self.reactTag,
                    @"src": @{ @"latitude": @(location.latitude),
                               @"longitude": @(location.longitude),
                               @"screenCoordY": @(screenCoord.y),
                               @"screenCoordX": @(screenCoord.x) } });
}

- (nonnull NSArray<id<MGLFeature>> *)visibleFeaturesAtPoint:(CGPoint)point
                               inStyleLayersWithIdentifiers:(nullable NSSet<NSString *> *)styleLayerIdentifiers
{
    return [_map visibleFeaturesAtPoint:point inStyleLayersWithIdentifiers:styleLayerIdentifiers];
}

- (nonnull NSArray<id<MGLFeature>> *)visibleFeaturesInRect:(CGRect)rect inStyleLayersWithIdentifiers:(NSSet<NSString *> *)identifiers
{
    return [_map visibleFeaturesInRect:rect inStyleLayersWithIdentifiers:identifiers];
}

- (void)mapViewDidFinishLoadingMap:(MGLMapView *)mapView
{
    if (!_onFinishLoadingMap) { return; }
    _onFinishLoadingMap(@{ @"target": self.reactTag });
}

- (void)mapViewWillStartLoadingMap:(MGLMapView *)mapView
{
    if (!_onStartLoadingMap) { return; }
    _onStartLoadingMap(@{ @"target": self.reactTag });
}

// Utils

- (unsigned int)intFromHexString:(NSString *)hexStr
{
    unsigned int hexInt = 0;

    // Create scanner
    NSScanner *scanner = [NSScanner scannerWithString:hexStr];

    // Tell scanner to skip the # character
    [scanner setCharactersToBeSkipped:[NSCharacterSet characterSetWithCharactersInString:@"#"]];

    // Scan hex value
    [scanner scanHexInt:&hexInt];

    return hexInt;
}


- (UIColor *)getUIColorObjectFromHexString:(NSString *)hexStr alpha:(CGFloat)alpha
{
    // Convert hex string to an integer
    unsigned int hexint = [self intFromHexString:hexStr];

    // Create color object, specifying alpha as well
    UIColor *color =
    [UIColor colorWithRed:((CGFloat) ((hexint & 0xFF0000) >> 16))/255
                    green:((CGFloat) ((hexint & 0xFF00) >> 8))/255
                     blue:((CGFloat) (hexint & 0xFF))/255
                    alpha:alpha];

    return color;
}

@end


@interface RCTMGLAnnotation ()

@property (nonatomic) CLLocationCoordinate2D coordinate;
@property (nonatomic) NSString *title;
@property (nonatomic) NSString *subtitle;

@end

@implementation RCTMGLAnnotation

+ (instancetype)annotationWithLocation:(CLLocationCoordinate2D)coordinate title:(NSString *)title subtitle:(NSString *)subtitle id:(NSString *)id
{
    return [[self alloc] initWithLocation:coordinate title:title subtitle:subtitle id:id];
}

+ (instancetype)annotationWithLocationRightCallout:(CLLocationCoordinate2D)coordinate title:(NSString *)title subtitle:(NSString *)subtitle id:(NSString *)id rightCalloutAccessory:(UIButton *)rightCalloutAccessory
{
    return [[self alloc] initWithLocationRightCallout:coordinate title:title subtitle:subtitle id:id rightCalloutAccessory:rightCalloutAccessory];
}


- (instancetype)initWithLocation:(CLLocationCoordinate2D)coordinate title:(NSString *)title subtitle:(NSString *)subtitle id:(NSString *)id
{
    if (self = [super init]) {
        _coordinate = coordinate;
        _title = title;
        _subtitle = subtitle;
        _id = id;
    }

    return self;
}


- (instancetype)initWithLocationRightCallout:(CLLocationCoordinate2D)coordinate title:(NSString *)title subtitle:(NSString *)subtitle id:(NSString *)id rightCalloutAccessory:(UIButton *)rightCalloutAccessory
{
    if (self = [super init]) {
        _rightCalloutAccessory = rightCalloutAccessory;
        _coordinate = coordinate;
        _title = title;
        _subtitle = subtitle;
        _id = id;
    }

    return self;
}
@end

@interface RCTMGLAnnotationPolyline ()
@end

@implementation RCTMGLAnnotationPolyline

+ (instancetype)polylineAnnotation:(CLLocationCoordinate2D *)coordinates strokeAlpha:(double)strokeAlpha strokeColor:(NSString *)strokeColor strokeWidth:(double)strokeWidth id:(NSString *)id type:(NSString *)type count:(NSUInteger)count
{
    RCTMGLAnnotationPolyline *polyline = [self polylineWithCoordinates:coordinates count:count];
    polyline.strokeAlpha = strokeAlpha;
    polyline.strokeColor = strokeColor;
    polyline.strokeWidth = strokeWidth;
    polyline.id = id;
    return polyline;
}
@end

@interface RCTMGLAnnotationPolygon ()
@end

@implementation RCTMGLAnnotationPolygon

+ (instancetype)polygonAnnotation:(CLLocationCoordinate2D *)coordinates fillAlpha:(double)fillAlpha fillColor:(NSString *)fillColor strokeColor:(NSString *)strokeColor strokeAlpha:(double)strokeAlpha id:(NSString *)id type:(NSString *)type count:(NSUInteger)count
{
    RCTMGLAnnotationPolygon *polygon = [self polygonWithCoordinates:coordinates count:count];
    polygon.fillAlpha = fillAlpha;
    polygon.fillColor = fillColor;
    polygon.strokeAlpha = strokeAlpha;
    polygon.strokeColor = strokeColor;
    polygon.id = id;
    return polygon;
}


@end
