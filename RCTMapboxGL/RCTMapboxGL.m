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

@implementation RCTMapboxGL {
    /* Required to publish events */
    RCTEventDispatcher *_eventDispatcher;
    
    /* Our map subview instance */
    MGLMapView *_map;
    
    /* Map properties */
    NSString *_accessToken;
    NSArray *_annotations;
    NSArray *_newAnnotations;
    CLLocationCoordinate2D _centerCoordinate;
    BOOL _clipsToBounds;
    BOOL _debugActive;
    double _direction;
    BOOL _finishedLoading;
    BOOL _rotateEnabled;
    BOOL _showsUserLocation;
    NSURL *_styleURL;
    double _zoomLevel;
}

RCT_EXPORT_MODULE();

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher
{
    if (self = [super init]) {
        _eventDispatcher = eventDispatcher;
        _clipsToBounds = YES;
        _finishedLoading = NO;
    }
    
    return self;
}

- (void)setAccessToken:(NSString *)accessToken
{
    _accessToken = accessToken;
    [self updateMap];
}

- (void)updateMap
{
    if (_map) {
        _map.centerCoordinate = _centerCoordinate;
        _map.clipsToBounds = _clipsToBounds;
        _map.debugActive = _debugActive;
        _map.direction = _direction;
        _map.rotateEnabled = _rotateEnabled;
        _map.showsUserLocation = _showsUserLocation;
        _map.styleURL = _styleURL;
        _map.zoomLevel = _zoomLevel;
        /* A bit of a hack because hooking into the fully rendered event didn't seem to work */
        [self performSelector:@selector(updateAnnotations) withObject:nil afterDelay:1];
    } else {
        /* We need to have a height/width specified in order to render */
        if (_accessToken && _styleURL && self.bounds.size.height > 0 && self.bounds.size.width > 0) {
            [self createMap];
        }
    }
}

- (void)createMap
{
    [MGLAccountManager setMapboxMetricsEnabledSettingShownInApp: YES];
    _map = [[MGLMapView alloc] initWithFrame:self.bounds accessToken:_accessToken styleURL:_styleURL];
    _map.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    _map.delegate = self;
    _map.userTrackingMode = MGLUserTrackingModeFollow;
    [self updateMap];
    [self addSubview:_map];
    [self layoutSubviews];
}


- (void)layoutSubviews
{
    [self updateMap];
    _map.frame = self.bounds;
}

- (void)setAnnotations:(NSArray *)annotations
{
    _newAnnotations = annotations;
    [self performSelector:@selector(updateAnnotations) withObject:nil afterDelay:0.1];
}

- (void)updateAnnotations
{
    if (_newAnnotations) {
        // Take into account any already placed pins
        if (_annotations.count) {
            [_map removeAnnotations: _annotations];
            _annotations = nil;
        }

        _annotations = _newAnnotations;
        [_map addAnnotations:_newAnnotations];
    }
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

- (void)setStyleURL:(NSURL*)styleURL
{
    _styleURL = styleURL;
    [self updateMap];
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

- (void)mapView:(MGLMapView *)mapView didUpdateUserLocation:(MGLUserLocation *)userLocation;
{
    NSDictionary *event = @{ @"target": self.reactTag,
                             @"userLocation": @{ @"latitude": @(userLocation.coordinate.latitude),
                                                 @"longitude": @(userLocation.coordinate.longitude),
                                                 @"headingAccuracy": @(userLocation.heading.headingAccuracy),
                                                 @"magneticHeading": @(userLocation.heading.magneticHeading),
                                                 @"trueHeading": @(userLocation.heading.trueHeading),
                                                 @"isUpdating": [NSNumber numberWithBool:userLocation.isUpdating]} };
    
    [_eventDispatcher sendInputEventWithName:@"topLoadingFinish" body:event];
}


-(void)mapView:(MGLMapView *)mapView didSelectAnnotation:(id<MGLAnnotation>)annotation
{
    if (annotation.title && annotation.subtitle) {
        NSDictionary *event = @{ @"target": self.reactTag,
                                 @"annotation": @{ @"title": annotation.title,
                                                   @"subtitle": annotation.subtitle,
                                                   @"latitude": @(annotation.coordinate.latitude),
                                                   @"longitude": @(annotation.coordinate.longitude)} };
        
        [_eventDispatcher sendInputEventWithName:@"topBlur" body:event];
    }
}


- (void)mapView:(RCTMapboxGL *)mapView regionDidChangeAnimated:(BOOL)animated
{
    
    CLLocationCoordinate2D region = _map.centerCoordinate;
    
    NSDictionary *event = @{ @"target": self.reactTag,
                             @"region": @{ @"latitude": @(region.latitude),
                                           @"longitude": @(region.longitude),
                                           @"zoom": [NSNumber numberWithDouble:_map.zoomLevel] } };
    
    [_eventDispatcher sendInputEventWithName:@"topChange" body:event];
}

- (BOOL)mapView:(RCTMapboxGL *)mapView annotationCanShowCallout:(id <MGLAnnotation>)annotation {
    return YES;
}

- (void)selectAnnotationAnimated:(NSUInteger)annotationInArray
{
    if ([_annotations count] <= annotationInArray) NSAssert(NO, @"Could not find annotation in array.");
    if ([_annotations count] != 0)
    {
        [_map selectAnnotation:_annotations[annotationInArray] animated:YES];
    }
}

@end

/* RCTMGLAnnotation */

@interface RCTMGLAnnotation ()

@property (nonatomic) CLLocationCoordinate2D coordinate;
@property (nonatomic) NSString *title;
@property (nonatomic) NSString *subtitle;

@end

@implementation RCTMGLAnnotation

+ (instancetype)annotationWithLocation:(CLLocationCoordinate2D)coordinate title:(NSString *)title subtitle:(NSString *)subtitle
{
    return [[self alloc] initWithLocation:coordinate title:title subtitle:subtitle];
}

- (instancetype)initWithLocation:(CLLocationCoordinate2D)coordinate title:(NSString *)title subtitle:(NSString *)subtitle
{
    if (self = [super init]) {
        _coordinate = coordinate;
        _title = title;
        _subtitle = subtitle;
    }
    
    return self;
}

@end
