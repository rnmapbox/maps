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
#import "RCTMGLCamera.h"

@implementation CameraStop

- (void)setMode:(NSNumber *)mode
{
    int modeInt = [mode intValue];
    
    if (modeInt == RCT_MAPBOX_CAMERA_MODE_FLIGHT) {
        _mode = [NSNumber numberWithInt:modeInt];
    } else if (modeInt == RCT_MAPBOX_CAMERA_MODE_NONE) {
        _mode = [NSNumber numberWithInt:modeInt];
    } else if (modeInt == RCT_MAPBOX_CAMERA_MODE_LINEAR) {
        _mode = [NSNumber numberWithInt:modeInt];
    } else {
        _mode = [NSNumber numberWithInt:RCT_MAPBOX_CAMERA_MODE_EASE];
    }
}

-(id)init {
     if (self = [super init])  {
         self.coordinate = kCLLocationCoordinate2DInvalid;
         self.bounds = MGLCoordinateBoundsMake(kCLLocationCoordinate2DInvalid, kCLLocationCoordinate2DInvalid);
     }
     return self;
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
    
    if (args[@"padding"]) {
        NSDictionary * padding = args[@"padding"];
        CGFloat paddingTop = padding[@"paddingTop"] ? [padding[@"paddingTop"] floatValue] : 0.0;
        CGFloat paddingRight = padding[@"paddingRight"] ? [padding[@"paddingRight"] floatValue] : 0.0;
        CGFloat paddingBottom = padding[@"paddingBottom"] ? [padding[@"paddingBottom"] floatValue] : 0.0;
        CGFloat paddingLeft = padding[@"paddingLeft"] ? [padding[@"paddingLeft"] floatValue] : 0.0;
        stop.padding = UIEdgeInsetsMake(paddingTop, paddingLeft, paddingBottom, paddingRight);
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
    }
    
    CGFloat paddingTop = args[@"paddingTop"] ? [args[@"paddingTop"] floatValue] : 0.0;
    CGFloat paddingRight = args[@"paddingRight"] ? [args[@"paddingRight"] floatValue] : 0.0;
    CGFloat paddingBottom = args[@"paddingBottom"] ? [args[@"paddingBottom"] floatValue] : 0.0;
    CGFloat paddingLeft = args[@"paddingLeft"] ? [args[@"paddingLeft"] floatValue] : 0.0;
    stop.padding = UIEdgeInsetsMake(paddingTop, paddingLeft, paddingBottom, paddingRight);
    
    NSTimeInterval duration = 2.0;
    if (args[@"duration"]) {
        duration = [RCTMGLUtils fromMS:args[@"duration"]];
    }
    stop.duration = duration;
    
    return stop;
}

@end
