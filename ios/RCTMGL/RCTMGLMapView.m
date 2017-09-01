//
//  RCTMGLMapView.m
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLMapView.h"
#import "RCTMGLUtils.h"
#import "UIView+React.h"

@implementation RCTMGLMapView

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
