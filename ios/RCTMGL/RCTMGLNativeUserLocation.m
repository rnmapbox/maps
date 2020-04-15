//
//  RCTMGLCamera.m
//  RCTMGL
//
//  Created by Nick Italiano on 6/22/18.
//  Copyright © 2018 Mapbox Inc. All rights reserved.
//

#import "RCTMGLNativeUserLocation.h"
#import "CameraStop.h"
#import "CameraUpdateQueue.h"
#import "RCTMGLLocation.h"
#import "RCTMGLUtils.h"
#import "RCTMGLLocationManager.h"
#import "RCTMGLEvent.h"
#import "RCTMGLEventTypes.h"
#import "CameraMode.h"

@implementation RCTMGLNativeUserLocation
{
    
}

- (void)setMap:(RCTMGLMapView *)map
{
    if (map == nil && _map) {
        _map.useNativeUserLocationAnnotationView = NO;
        _map.showsUserLocation = NO;
        _map.showsUserHeadingIndicator = NO;
    } else if (map) {
        map.useNativeUserLocationAnnotationView = YES;
        // Toggle off/on showsUserLocation in order for Mapbox to invalidate the
        // current (hidden) user location annotation view. See also: HiddenUserLocationAnnotationView
        map.showsUserLocation = NO;
        map.showsUserLocation = YES;
        map.showsUserHeadingIndicator = self.iosShowsUserHeadingIndicator;
    }
    
    _map = map;
}

- (void)setIosShowsUserHeadingIndicator:(BOOL)iosShowsUserHeadingIndicator {
    _iosShowsUserHeadingIndicator = iosShowsUserHeadingIndicator;
    if (_map) {
        _map.showsUserHeadingIndicator = iosShowsUserHeadingIndicator;
    }
}

@end
