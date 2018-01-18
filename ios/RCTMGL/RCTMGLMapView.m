//
//  RCTMGLMapView.m
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLMapView.h"
#import "CameraUpdateQueue.h"
#import "RCTMGLUtils.h"
#import "RNMBImageUtils.h"
#import "UIView+React.h"

@implementation RCTMGLMapView

static double const DEG2RAD = M_PI / 180;
static double const LAT_MAX = 85.051128779806604;
static double const TILE_SIZE = 256;
static double const EARTH_RADIUS_M = 6378137;
static double const M2PI = M_PI * 2;

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        _cameraUpdateQueue = [[CameraUpdateQueue alloc] init];
        _sources = [[NSMutableArray alloc] init];
        _pointAnnotations = [[NSMutableArray alloc] init];
        _reactSubviews = [[NSMutableArray alloc] init];
    }
    return self;
}

- (void)invalidate
{
    if (_reactSubviews.count == 0) {
        return;
    }
    for (int i = 0; i < _reactSubviews.count; i++) {
        [self removeReactSubview:(UIView *)_reactSubviews[i]];
    }
}

- (void) addToMap:(id<RCTComponent>)subview
{
    if ([subview isKindOfClass:[RCTMGLSource class]]) {
        RCTMGLSource *source = (RCTMGLSource*)subview;
        source.map = self;
        [_sources addObject:(RCTMGLSource*)subview];
    } else if ([subview isKindOfClass:[RCTMGLLight class]]) {
        RCTMGLLight *light = (RCTMGLLight*)subview;
        _light = light;
        _light.map = self;
    } else if ([subview isKindOfClass:[RCTMGLPointAnnotation class]]) {
        RCTMGLPointAnnotation *pointAnnotation = (RCTMGLPointAnnotation *)subview;
        pointAnnotation.map = self;
        [_pointAnnotations addObject:pointAnnotation];
    } else {
        NSArray<id<RCTComponent>> *childSubviews = [subview reactSubviews];

        for (int i = 0; i < childSubviews.count; i++) {
            [self addToMap:childSubviews[i]];
        }
    }
}

- (void) removeFromMap:(id<RCTComponent>)subview
{
    if ([subview isKindOfClass:[RCTMGLSource class]]) {
        RCTMGLSource *source = (RCTMGLSource*)subview;
        source.map = nil;
        [_sources removeObject:source];
    } else if ([subview isKindOfClass:[RCTMGLPointAnnotation class]]) {
        RCTMGLPointAnnotation *pointAnnotation = (RCTMGLPointAnnotation *)subview;
        pointAnnotation.map = nil;
        [_pointAnnotations removeObject:pointAnnotation];
    } else {
        NSArray<id<RCTComponent>> *childSubViews = [subview reactSubviews];
        
        for (int i = 0; i < childSubViews.count; i++) {
            [self removeFromMap:childSubViews[i]];
        }
    }
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)insertReactSubview:(id<RCTComponent>)subview atIndex:(NSInteger)atIndex {
    [self addToMap:subview];
    [_reactSubviews insertObject:(UIView *)subview atIndex:(NSUInteger) atIndex];
}
#pragma clang diagnostic pop

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)removeReactSubview:(id<RCTComponent>)subview {
    // similarly, when the children are being removed we have to do the appropriate
    // underlying mapview action here.
    [self removeFromMap:subview];
    [_reactSubviews removeObject:(UIView *)subview];
}
#pragma clang diagnostic pop

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (NSArray<id<RCTComponent>> *)reactSubviews {
    return _reactSubviews;
}
#pragma clang diagnostic pop

- (void)setReactZoomEnabled:(BOOL)reactZoomEnabled
{
    _reactZoomEnabled = reactZoomEnabled;
    self.zoomEnabled = _reactZoomEnabled;
}

- (void)setReactScrollEnabled:(BOOL)reactScrollEnabled
{
    _reactScrollEnabled = reactScrollEnabled;
    self.scrollEnabled = _reactScrollEnabled;
}

- (void)setReactPitchEnabled:(BOOL)reactPitchEnabled
{
    _reactPitchEnabled = reactPitchEnabled;
    self.pitchEnabled = _reactPitchEnabled;
}

- (void)setReactRotateEnabled:(BOOL)reactRotateEnabled
{
    _reactRotateEnabled = reactRotateEnabled;
    self.rotateEnabled = _reactRotateEnabled;
}

- (void)setReactAttributionEnabled:(BOOL)reactAttributionEnabled
{
    _reactAttributionEnabled = reactAttributionEnabled;
    self.attributionButton.hidden = !_reactAttributionEnabled;
    
}

- (void)setReactLogoEnabled:(BOOL)reactLogoEnabled
{
    _reactLogoEnabled = reactLogoEnabled;
    self.logoView.hidden = !_reactLogoEnabled;
}

- (void)setReactCompassEnabled:(BOOL)reactCompassEnabled
{
    _reactCompassEnabled = reactCompassEnabled;
    self.compassView.hidden = !_reactCompassEnabled;
}

- (void)setReactShowUserLocation:(BOOL)reactShowUserLocation
{
    _reactShowUserLocation = reactShowUserLocation;
    self.showsUserLocation = _reactShowUserLocation;
}

- (void)setReactCenterCoordinate:(NSString *)reactCenterCoordinate
{
    _reactCenterCoordinate = reactCenterCoordinate;
    [self _updateCameraIfNeeded:YES];
}

- (void)setReactContentInset:(NSArray<NSNumber *> *)reactContentInset
{
    CGFloat top = 0.0f, right = 0.0f, left = 0.0f, bottom = 0.0f;
    
    if (reactContentInset.count == 4) {
        top = [reactContentInset[0] floatValue];
        right = [reactContentInset[1] floatValue];
        bottom = [reactContentInset[2] floatValue];
        left = [reactContentInset[3] floatValue];
    } else if (reactContentInset.count == 2) {
        top = [reactContentInset[0] floatValue];
        right = [reactContentInset[1] floatValue];
        bottom = [reactContentInset[0] floatValue];
        left = [reactContentInset[1] floatValue];
    } else if (reactContentInset.count == 1) {
        top = [reactContentInset[0] floatValue];
        right = [reactContentInset[0] floatValue];
        bottom = [reactContentInset[0] floatValue];
        left = [reactContentInset[0] floatValue];
    }
    
    self.contentInset = UIEdgeInsetsMake(top, left, bottom, right);
}

- (void)setReactStyleURL:(NSString *)reactStyleURL
{
    _reactStyleURL = reactStyleURL;
    [self _removeAllSourcesFromMap];
    self.styleURL = [self _getStyleURLFromKey:_reactStyleURL];
}

- (void)setHeading:(double)heading
{
    _heading = heading;
    [self _updateCameraIfNeeded:NO];
}

- (void)setPitch:(double)pitch
{
    _pitch = pitch;
    [self _updateCameraIfNeeded:NO];
}

- (void)setReactZoomLevel:(double)reactZoomLevel
{
    _reactZoomLevel = reactZoomLevel;
    self.zoomLevel = _reactZoomLevel;
}

- (void)setReactMinZoomLevel:(double)reactMinZoomLevel
{
    _reactMinZoomLevel = reactMinZoomLevel;
    self.minimumZoomLevel = _reactMinZoomLevel;
}

- (void)setReactMaxZoomLevel:(double)reactMaxZoomLevel
{
    _reactMaxZoomLevel = reactMaxZoomLevel;
    self.maximumZoomLevel = reactMaxZoomLevel;
}

- (void)setReactUserTrackingMode:(int)reactUserTrackingMode
{
    _reactUserTrackingMode = reactUserTrackingMode;
    [self setUserTrackingMode:_reactUserTrackingMode animated:NO];
    self.showsUserHeadingIndicator = (NSUInteger)_reactUserTrackingMode == MGLUserTrackingModeFollowWithHeading;
}

- (void)setReactUserLocationVerticalAlignment:(int)reactUserLocationVerticalAlignment
{
    _reactUserLocationVerticalAlignment = reactUserLocationVerticalAlignment;
    self.userLocationVerticalAlignment = reactUserLocationVerticalAlignment;
}

#pragma mark - methods

- (NSString *)takeSnap:(BOOL)writeToDisk
{
    UIGraphicsBeginImageContextWithOptions(self.bounds.size, YES, 0);
    [self drawViewHierarchyInRect:self.bounds afterScreenUpdates:YES];
    UIImage *snapshot = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return writeToDisk ? [RNMBImageUtils createTempFile:snapshot] : [RNMBImageUtils createBase64:snapshot];
}

- (CLLocationDistance)getMetersPerPixelAtLatitude:(double)latitude withZoom:(double)zoomLevel
{
    double constrainedZoom = [[RCTMGLUtils clamp:[NSNumber numberWithDouble:zoomLevel]
                                             min:[NSNumber numberWithDouble:self.minimumZoomLevel]
                                             max:[NSNumber numberWithDouble:self.maximumZoomLevel]] doubleValue];
    
    double constrainedLatitude = [[RCTMGLUtils clamp:[NSNumber numberWithDouble:latitude]
                                                 min:[NSNumber numberWithDouble:-LAT_MAX]
                                                 max:[NSNumber numberWithDouble:LAT_MAX]] doubleValue];
    
    double constrainedScale = pow(2.0, constrainedZoom);
    return cos(constrainedLatitude * DEG2RAD) * M2PI * EARTH_RADIUS_M / (constrainedScale * TILE_SIZE);
}

- (CLLocationDistance)altitudeFromZoom:(double)zoomLevel
{
    CLLocationDistance metersPerPixel = [self getMetersPerPixelAtLatitude:self.camera.centerCoordinate.latitude withZoom:zoomLevel];
    CLLocationDistance metersTall = metersPerPixel * self.frame.size.height;
    CLLocationDistance altitude = metersTall / 2 / tan(MGLRadiansFromDegrees(30) / 2.0);
    return altitude * sin(M_PI_2 - MGLRadiansFromDegrees(self.camera.pitch)) / sin(M_PI_2);
}

- (RCTMGLPointAnnotation*)getRCTPointAnnotation:(MGLPointAnnotation *)mglAnnotation
{
    for (int i = 0; i < _pointAnnotations.count; i++) {
        RCTMGLPointAnnotation *rctAnnotation = _pointAnnotations[i];
        if (rctAnnotation.annotation == mglAnnotation) {
            return rctAnnotation;
        }
    }
    return nil;
}

- (NSArray<RCTMGLSource *> *)getAllTouchableSources
{
    NSMutableArray<RCTMGLSource *> *touchableSources = [[NSMutableArray alloc] init];
    
    for (RCTMGLSource *source in _sources) {
        if (source.hasPressListener) {
            [touchableSources addObject:source];
        }
    }
    
    return touchableSources;
}

- (RCTMGLSource *)getTouchableSourceWithHighestZIndex:(NSArray<RCTMGLSource *> *)touchableSources
{
    if (touchableSources == nil || touchableSources.count == 0) {
        return nil;
    }
    
    if (touchableSources.count == 1) {
        return touchableSources[0];
    }
    
    NSMutableDictionary<NSString *, RCTMGLSource *> *layerToSoureDict = [[NSMutableDictionary alloc] init];
    for (RCTMGLSource *touchableSource in touchableSources) {
        NSArray<NSString *> *layerIDs = [touchableSource getLayerIDs];
        
        for (NSString *layerID in layerIDs) {
            layerToSoureDict[layerID] = touchableSource;
        }
    }
    
    NSArray<MGLStyleLayer *> *layers = self.style.layers;
    for (int i = (int)layers.count - 1; i >= 0; i--) {
        MGLStyleLayer *layer = layers[i];
        
        RCTMGLSource *source = layerToSoureDict[layer.identifier];
        if (source != nil) {
            return source;
        }
    }
    
    return nil;
}

- (NSURL*)_getStyleURLFromKey:(NSString *)styleURL
{
    return [NSURL URLWithString:styleURL];
}

- (void)_updateCameraIfNeeded:(BOOL)shouldUpdateCenterCoord
{
    if (shouldUpdateCenterCoord) {
        [self setCenterCoordinate:[RCTMGLUtils fromFeature:_reactCenterCoordinate] animated:_animated];
    } else {
        MGLMapCamera *camera = [self.camera copy];
        camera.pitch = _pitch;
        camera.heading = _heading;
        [self setCamera:camera animated:_animated];
    }
}

- (void)_removeAllSourcesFromMap
{
    if (self.style == nil || _sources.count == 0) {
        return;
    }
    for (RCTMGLSource *source in _sources) {
        source.map = nil;
    }
}

@end
