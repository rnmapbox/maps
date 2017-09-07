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
    }
    return self;
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

- (void)setReactStyleURL:(NSString *)reactStyleURL
{
    _reactStyleURL = reactStyleURL;
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
    [self setUserTrackingMode:(NSUInteger)_reactUserTrackingMode animated:_animated];
}

#pragma mark - methods

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

@end
