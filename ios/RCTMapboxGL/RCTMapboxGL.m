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

@implementation RCTMapboxGL {
    /* Required to publish events */
    RCTEventDispatcher *_eventDispatcher;

    /* Our map subview instance */
    MGLMapView *_map;

    /* Map properties */
    NSString *_accessToken;
    NSMutableDictionary *_annotations;
    CLLocationCoordinate2D _centerCoordinate;
    BOOL _clipsToBounds;
    BOOL _debugActive;
    double _direction;
    BOOL _finishedLoading;
    BOOL _rotateEnabled;
    BOOL _scrollEnabled;
    BOOL _zoomEnabled;
    BOOL _showsUserLocation;
    NSURL *_styleURL;
    double _zoomLevel;
    UIButton *_rightCalloutAccessory;
    int _userTrackingMode;
    BOOL _attributionButton;
    BOOL _logo;
    BOOL _compass;
}

RCT_EXPORT_MODULE();

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher
{
    if (self = [super init]) {
        _eventDispatcher = eventDispatcher;
        _clipsToBounds = YES;
        _finishedLoading = NO;
        _annotations = [NSMutableDictionary dictionary];
    }

    return self;
}

- (void)setAccessToken:(NSString *)accessToken
{
    if ([accessToken isEqualToString:@"your-mapbox.com-access-token"] || [accessToken length] == 0) {
        RCTLogError(@"No access token specified. Go to mapbox.com to signup and get an access token.");
    } else {
        _accessToken = accessToken;
        [self updateMap];
    }
}

- (void)updateMap
{
    if (_map) {
        _map.centerCoordinate = _centerCoordinate;
        _map.clipsToBounds = _clipsToBounds;
        _map.debugActive = _debugActive;
        _map.direction = _direction;
        _map.rotateEnabled = _rotateEnabled;
        _map.scrollEnabled = _scrollEnabled;
        _map.zoomEnabled = _zoomEnabled;
        _map.showsUserLocation = _showsUserLocation;
        _map.styleURL = _styleURL;
        _map.zoomLevel = _zoomLevel;
        _map.contentInset = _contentInset;
        [_map.attributionButton setHidden:_attributionButton];
        [_map.logoView setHidden:_logo];
        [_map.compassView setHidden:_compass];
        _map.userLocationVerticalAlignment = _userLocationVerticalAlignment;
        _map.userTrackingMode = _userTrackingMode;
    } else {
        /* We need to have a height/width specified in order to render */
        if (_accessToken && _styleURL && self.bounds.size.height > 0 && self.bounds.size.width > 0) {
            [self createMap];
        }
    }
}

- (void)createMap
{
    [MGLAccountManager setAccessToken:_accessToken];
    _map = [[MGLMapView alloc] initWithFrame:self.bounds];
    _map.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    _map.delegate = self;

    UILongPressGestureRecognizer *longPress = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(handleLongPress:)];
    [self addGestureRecognizer:longPress];

    [self updateMap];
    [self addSubview:_map];
    [self layoutSubviews];
}


- (void)layoutSubviews
{
    if (_annotations.count == 0) {
        [self updateMap];
    }
    _map.frame = self.bounds;
}

- (void)setAnnotations:(NSMutableArray *)annotations
{
    [self performSelector:@selector(updateAnnotations:) withObject:annotations afterDelay:0.5];
}

- (void)updateAnnotations:(NSMutableArray *) annotations {
    for (RCTMGLAnnotation *annotation in annotations) {
        NSString *id = [annotation id];
        if ([id length] != 0) {
            [_annotations setObject:annotation forKey:id];
        } else {
            RCTLogError(@"field `id` is required on all annotation");
        }
        [_map addAnnotation:annotation];
    }
}

- (void)addAnnotation:(RCTMGLAnnotation *) annotation {
    [_annotations setObject:annotation forKey:[annotation id]];
    [_map addAnnotation:annotation];
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

- (void)setCenterCoordinate:(CLLocationCoordinate2D)centerCoordinate
{
    _centerCoordinate = centerCoordinate;
    [self updateMap];
}


- (void)setDebugActive:(BOOL)debugActive
{
    _debugActive = debugActive;
    [self updateMap];
}

- (void)setRotateEnabled:(BOOL)rotateEnabled
{
    _rotateEnabled = rotateEnabled;
    [self updateMap];
}

- (void)setScrollEnabled:(BOOL)scrollEnabled
{
    _scrollEnabled = scrollEnabled;
    [self updateMap];
}

- (void)setZoomEnabled:(BOOL)zoomEnabled
{
    _zoomEnabled = zoomEnabled;
    [self updateMap];
}

- (void)setShowsUserLocation:(BOOL)showsUserLocation
{
    _showsUserLocation = showsUserLocation;
    [self updateMap];
}

- (void)setClipsToBounds:(BOOL)clipsToBounds
{
    _clipsToBounds = clipsToBounds;
    [self updateMap];
}

- (void)setDirection:(double)direction
{
    _direction = direction;
    [self updateMap];
}

- (void)setZoomLevel:(double)zoomLevel
{
    _zoomLevel = zoomLevel;
    [self updateMap];
}

- (void)setStyleURL:(NSURL *)styleURL
{
    _styleURL = styleURL;
    [self updateMap];
}

- (void)setAttributionButtonVisibility:(BOOL)isVisible
{
    _attributionButton = isVisible;
    [self updateMap];
}

- (void)setLogoVisibility:(BOOL)isVisible
{
    _logo = isVisible;
    [self updateMap];
}

- (void)setCompassVisibility:(BOOL)isVisible
{
    _compass = isVisible;
    [self updateMap];
}

- (void)setUserTrackingMode:(int)userTrackingMode
{
    if (userTrackingMode > 3 || userTrackingMode < 0) {
        _userTrackingMode = 0;
    } else {
        _userTrackingMode = userTrackingMode;
    }
    [self performSelector:@selector(updateMap) withObject:nil afterDelay:0.2];
}

- (void)setRightCalloutAccessory:(UIButton *)rightCalloutAccessory
{
    _rightCalloutAccessory = rightCalloutAccessory;
}

-(void)setDirectionAnimated:(int)heading
{
    [_map setDirection:heading animated:YES];
}

-(void)setZoomLevelAnimated:(double)zoomLevel
{
    [_map setZoomLevel:zoomLevel animated:YES];
}

-(void)setCenterCoordinateAnimated:(CLLocationCoordinate2D)coordinates
{
    [_map setCenterCoordinate:coordinates animated:YES];
}

-(void)setCenterCoordinateZoomLevelAnimated:(CLLocationCoordinate2D)coordinates zoomLevel:(double)zoomLevel
{
    [_map setCenterCoordinate:coordinates zoomLevel:zoomLevel animated:YES];
}

- (void)setVisibleCoordinateBounds:(MGLCoordinateBounds)bounds edgePadding:(UIEdgeInsets)padding animated:(BOOL)animated
{
    [_map setVisibleCoordinateBounds:bounds edgePadding:padding animated:animated];
}

- (void)mapView:(MGLMapView *)mapView didUpdateUserLocation:(MGLUserLocation *)userLocation;
{
    NSDictionary *event = @{ @"target": self.reactTag,
                             @"src": @{ @"latitude": @(userLocation.coordinate.latitude),
                                        @"longitude": @(userLocation.coordinate.longitude),
                                        @"headingAccuracy": @(userLocation.heading.headingAccuracy),
                                        @"magneticHeading": @(userLocation.heading.magneticHeading),
                                        @"trueHeading": @(userLocation.heading.trueHeading),
                                        @"isUpdating": [NSNumber numberWithBool:userLocation.isUpdating]} };

    [_eventDispatcher sendInputEventWithName:@"onUpdateUserLocation" body:event];
}


-(void)mapView:(MGLMapView *)mapView didSelectAnnotation:(id<MGLAnnotation>)annotation
{
    if (annotation.title && annotation.subtitle) {

        NSString *id = [(RCTMGLAnnotation *) annotation id];

        NSDictionary *event = @{ @"target": self.reactTag,
                                 @"src": @{ @"title": annotation.title,
                                            @"subtitle": annotation.subtitle,
                                            @"id": id,
                                            @"latitude": @(annotation.coordinate.latitude),
                                            @"longitude": @(annotation.coordinate.longitude)} };

        [_eventDispatcher sendInputEventWithName:@"onOpenAnnotation" body:event];
    }
}


- (void)mapView:(RCTMapboxGL *)mapView regionDidChangeAnimated:(BOOL)animated
{

    CLLocationCoordinate2D region = _map.centerCoordinate;

    NSDictionary *event = @{ @"target": self.reactTag,
                             @"src": @{ @"latitude": @(region.latitude),
                                        @"longitude": @(region.longitude),
                                        @"zoom": [NSNumber numberWithDouble:_map.zoomLevel] } };

    [_eventDispatcher sendInputEventWithName:@"onRegionChange" body:event];
}


- (void)mapView:(RCTMapboxGL *)mapView regionWillChangeAnimated:(BOOL)animated
{

    CLLocationCoordinate2D region = _map.centerCoordinate;

    NSDictionary *event = @{ @"target": self.reactTag,
                             @"src": @{ @"latitude": @(region.latitude),
                                        @"longitude": @(region.longitude),
                                        @"zoom": [NSNumber numberWithDouble:_map.zoomLevel] } };

    [_eventDispatcher sendInputEventWithName:@"onRegionWillChange" body:event];
}

- (BOOL)mapView:(RCTMapboxGL *)mapView annotationCanShowCallout:(id <MGLAnnotation>)annotation {
    NSString *title = [(RCTMGLAnnotation *) annotation title];
    NSString *subtitle = [(RCTMGLAnnotation *) annotation subtitle];
    if ([title length] != 0 || [subtitle length] != 0 ) {
        return YES;
    } else {
        return NO;
    }
}

-(CLLocationCoordinate2D)centerCoordinate {
    return _map.centerCoordinate;
}

-(double)direction {
    return _map.direction;
}

-(double)zoomLevel {
    return _map.zoomLevel;
}

- (void)selectAnnotationAnimated:(NSString*)selectedIdentifier
{
    [_map selectAnnotation:[_annotations objectForKey:selectedIdentifier] animated:YES];
}

- (void)removeAnnotation:(NSString*)selectedIdentifier
{
    NSUInteger keyCount = [_annotations count];
    if (keyCount > 0) {
        [_map removeAnnotation:[_annotations objectForKey:selectedIdentifier]];
        [_annotations removeObjectForKey:selectedIdentifier];
    }
}

- (void) setContentInset:(UIEdgeInsets)inset
{
    _contentInset = inset;
    [self updateMap];
}

- (void)removeAllAnnotations
{
    NSUInteger keyCount = [_annotations count];
    if (keyCount > 0) {
        [_map removeAnnotations:_map.annotations];
        [_annotations removeAllObjects];
    }
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
    NSString *url = [(RCTMGLAnnotation *) annotation annotationImageURL];
    if (!url) { return nil; }

    CGSize imageSize = [(RCTMGLAnnotation *) annotation annotationImageSize];
    MGLAnnotationImage *annotationImage = [mapView dequeueReusableAnnotationImageWithIdentifier:url];

    if (!annotationImage) {
        UIImage *image = nil;
        if ([url hasPrefix:@"image!"]) {
            NSString* localImagePath = [url substringFromIndex:6];
            image = [UIImage imageNamed:localImagePath];
        } else {
            image = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:url]]];
        }
        UIGraphicsBeginImageContextWithOptions(imageSize, NO, 0.0);
        [image drawInRect:CGRectMake(0, 0, imageSize.width, imageSize.height)];
        UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        annotationImage = [MGLAnnotationImage annotationImageWithImage:newImage reuseIdentifier:url];
    }

    return annotationImage;
}

- (void)handleSingleTap:(UITapGestureRecognizer *)sender
{
    CLLocationCoordinate2D location = [_map convertPoint:[sender locationInView:_map] toCoordinateFromView:_map];
    CGPoint screenCoord = [sender locationInView:_map];

    NSDictionary *event = @{ @"target": self.reactTag,
                             @"src": @{
                                     @"latitude": @(location.latitude),
                                     @"longitude": @(location.longitude),
                                     @"screenCoordY": @(screenCoord.y),
                                     @"screenCoordX": @(screenCoord.x)
                                     }
                             };

    [_eventDispatcher sendInputEventWithName:@"onTap" body:event];
}

- (void)handleLongPress:(UITapGestureRecognizer *)sender
{
    if (sender.state == UIGestureRecognizerStateBegan) {
        CLLocationCoordinate2D location = [_map convertPoint:[sender locationInView:_map] toCoordinateFromView:_map];
        CGPoint screenCoord = [sender locationInView:_map];

        NSDictionary *event = @{ @"target": self.reactTag,
                                 @"src": @{
                                         @"latitude": @(location.latitude),
                                         @"longitude": @(location.longitude),
                                         @"screenCoordY": @(screenCoord.y),
                                         @"screenCoordX": @(screenCoord.x)
                                         }
                                 };

        [_eventDispatcher sendInputEventWithName:@"onLongPress" body:event];
    }
}

- (void)mapViewDidFinishLoadingMap:(MGLMapView *)mapView
{
    NSDictionary *event = @{ @"target": self.reactTag };

    [_eventDispatcher sendInputEventWithName:@"onFinishLoadingMap" body:event];
}
- (void)mapViewWillStartLoadingMap:(MGLMapView *)mapView
{
    NSDictionary *event = @{ @"target": self.reactTag };

    [_eventDispatcher sendInputEventWithName:@"onStartLoadingMap" body:event];
}

- (void)mapView:(MGLMapView *)mapView didFailToLocateUserWithError:(NSError *)error
{
    NSDictionary *event = @{ @"target": mapView.reactTag,
                             @"src": @{
                                     @"message":  [error localizedDescription]
                                     }
                             };

    [_eventDispatcher sendInputEventWithName:@"onLocateUserFailed" body:event];
}

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
