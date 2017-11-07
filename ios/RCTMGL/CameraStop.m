//
//  CameraStop.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/5/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "CameraStop.h"
#import "CameraMode.h"
#import "RCTMGLUtils.h"

@implementation CameraStop

- (void)setMode:(NSNumber *)mode
{
    int modeInt = [mode intValue];
    
    if (modeInt == RCT_MAPBOX_CAMERA_MODE_FLIGHT) {
        _mode = [NSNumber numberWithInt:modeInt];
    } else if (modeInt == RCT_MAPBOX_CAMERA_MODE_NONE) {
        _mode = [NSNumber numberWithInt:modeInt];
    } else {
        _mode = [NSNumber numberWithInt:RCT_MAPBOX_CAMERA_MODE_EASE];
    }
}

+ (CameraStop*)fromDictionary:(NSDictionary *)args
{
    CameraStop *stop = [[CameraStop alloc] init];
    
    if (args[@"pitch"]) {
        stop.pitch = args[@"pitch"];
    }
    
    if (args[@"heading"]) {
        stop.heading = args[@"heading"];
    }
    
    if (args[@"centerCoordinate"]) {
        stop.coordinate = [RCTMGLUtils fromFeature:args[@"centerCoordinate"]];
    }
    
    if (args[@"zoom"]) {
        stop.zoom = args[@"zoom"];
    }
    
    if (args[@"mode"]) {
        stop.mode = args[@"mode"];
    }
    
    if (args[@"bounds"]) {
        stop.bounds = [RCTMGLUtils fromFeatureCollection:args[@"bounds"]];
        
        if (args[@"boundsPaddingLeft"]) {
            stop.boundsPaddingLeft = args[@"boundsPaddingLeft"];
        }
        
        if (args[@"boundsPaddingRight"]) {
            stop.boundsPaddingRight = args[@"boundsPaddingRight"];
        }
        
        if (args[@"boundsPaddingTop"]) {
            stop.boundsPaddingTop = args[@"boundsPaddingTop"];
        }
        
        if (args[@"boundsPaddingBottom"]) {
            stop.boundsPaddingBottom = args[@"boundsPaddingBottom"];
        }
    }
    
    NSTimeInterval duration = 2.0;
    if (args[@"duration"]) {
        duration = [RCTMGLUtils fromMS:args[@"duration"]];
    }
    stop.duration = duration;
    
    return stop;
}

@end
