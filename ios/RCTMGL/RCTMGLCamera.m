//
//  RCTMGLCamera.m
//  RCTMGL
//
//  Created by Nick Italiano on 6/22/18.
//  Copyright © 2018 Mapbox Inc. All rights reserved.
//

#import "RCTMGLCamera.h"
#import "CameraStop.h"
#import "CameraUpdateQueue.h"
#import "RCTMGLLocation.h"
#import "RCTMGLUtils.h"
#import "RCTMGLLocationManager.h"

@implementation RCTMGLCamera
{
    CameraUpdateQueue *cameraUpdateQueue;
    RCTMGLCamera *followCamera;
}

- (instancetype)init
{
    if (self = [super init]) {
        cameraUpdateQueue = [[CameraUpdateQueue alloc] init];
    }
    return self;
}

- (void)setStop:(NSDictionary<NSString *,id> *)stop
{
    _stop = stop;
    
    if (_map != nil) {
        if (_followUserLocation) {
            [self _updateCameraFromTrackingMode];
        } else {
            [self _updateCameraFromJavascript];
        }
    }
}

- (void)setMap:(RCTMGLMapView *)map
{
    _map = map;
    
    if (_map != nil) {
        if (_followUserLocation) {
            [self _updateCameraFromTrackingMode];
        } else {
            [self _updateCameraFromJavascript];
        }
    }
}

- (void)setFollowUserLocation:(BOOL)followUserLocation
{
    _followUserLocation = followUserLocation;
    [self _updateCameraFromTrackingMode];
}

- (void)setFollowUserMode:(NSString *)followUserMode
{
    _followUserMode = followUserMode;
    [self _updateCameraFromTrackingMode];
}

- (void)setFollowPitch:(NSNumber *)followPitch
{
    _followPitch = followPitch;
    [self _updateCameraFromTrackingMode];
}

- (void)setFollowZoomLevel:(NSNumber *)followZoomLevel
{
    _followZoomLevel = followZoomLevel;
    [self _updateCameraFromTrackingMode];
}

- (void)setFollowHeading:(NSNumber *)followHeading
{
    _followHeading = followHeading;
    [self _updateCameraFromTrackingMode];
}

- (void)_updateCameraFromJavascript
{
    if (_stop == nil) {
        return;
    }
    
    if (_followUserLocation) {
        return;
    }
    
    if (_map != nil && _map.userTrackingMode != MGLUserTrackingModeNone) {
        _map.userTrackingMode = MGLUserTrackingModeNone;
    }
    
    [cameraUpdateQueue enqueue:[CameraStop fromDictionary:_stop]];
    [cameraUpdateQueue execute:_map];
}

- (void)_updateCameraFromTrackingMode
{
    if (!_followUserLocation || _map == nil) {
        _map.userTrackingMode = MGLUserTrackingModeNone;
        return;
    }
    
    if (_map.userTrackingMode != [self _userTrackingMode]) {
        _map.showsUserLocation = [self _userTrackingMode] != MGLUserTrackingModeNone;
        _map.userTrackingMode = [self _userTrackingMode];
    }
    
    MGLMapCamera *camera = _map.camera;
    if (_followPitch != nil && [_followPitch floatValue] >= 0.0) {
        camera.pitch = [_followPitch floatValue];
    } else if (_stop != nil && _stop[@"pitch"] != nil) {
        camera.pitch = [_stop[@"pitch"] floatValue];
    }
    
    if ([self _userTrackingMode] != MGLUserTrackingModeFollowWithCourse && [self _userTrackingMode] != MGLUserTrackingModeFollowWithHeading) {
        if (_followHeading != nil && [_followHeading floatValue] >= 0.0) {
            camera.heading = [_followHeading floatValue];
        } else if (_stop != nil && _stop[@"heading"] != nil) {
            camera.heading = [_stop[@"heading"] floatValue];
        }
    }
    
    if (_followZoomLevel != nil && [_followZoomLevel doubleValue] >= 0.0) {
        camera.altitude = [_map altitudeFromZoom:[_followZoomLevel doubleValue]];
    }
    
    [_map setCamera:camera animated:YES];
}

- (NSUInteger)_userTrackingMode
{
    if ([_followUserMode isEqualToString:@"heading"]) {
        return MGLUserTrackingModeFollowWithHeading;
    } else if ([_followUserMode isEqualToString:@"course"]) {
        return MGLUserTrackingModeFollowWithCourse;
    } else if (_followUserLocation) {
        return MGLUserTrackingModeFollow;
    } else {
        return MGLUserTrackingModeNone;
    }
}

@end
