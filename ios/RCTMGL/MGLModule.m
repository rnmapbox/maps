//
//  MGLModule.m
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "MGLModule.h"
#import "RCTMGLEventTypes.h"
#import "CameraMode.h"
#import "RCTSource.h"
@import Mapbox;

@implementation MGLModule

RCT_EXPORT_MODULE();

- (NSDictionary<NSString *, id> *)constantsToExport
{
    // style urls
    NSMutableDictionary *styleURLS = [[NSMutableDictionary alloc] init];
    [styleURLS setObject:[MGLStyle.streetsStyleURL absoluteString] forKey:@"Street"];
    [styleURLS setObject:[MGLStyle.darkStyleURL absoluteString] forKey:@"Dark"];
    [styleURLS setObject:[MGLStyle.lightStyleURL absoluteString] forKey:@"Light"];
    [styleURLS setObject:[MGLStyle.outdoorsStyleURL absoluteString] forKey:@"Outdoors"];
    [styleURLS setObject:[MGLStyle.satelliteStyleURL absoluteString] forKey:@"Satellite"];
    [styleURLS setObject:[MGLStyle.satelliteStreetsStyleURL absoluteString] forKey:@"SatelliteStreet"];
    [styleURLS setObject:[MGLStyle.trafficDayStyleURL absoluteString] forKey:@"TrafficDay"];
    [styleURLS setObject:[MGLStyle.trafficNightStyleURL absoluteString] forKey:@"TrafficNight"];
    
    // event types
    NSMutableDictionary *eventTypes = [[NSMutableDictionary alloc] init];
    [eventTypes setObject:RCT_MAPBOX_EVENT_TAP forKey:@"MapClick"];
    [eventTypes setObject:RCT_MAPBOX_EVENT_LONGPRESS forKey:@"MapLongClick"];
    [eventTypes setObject:RCT_MAPBOX_REGION_WILL_CHANGE_EVENT forKey:@"RegionWillChange"];
    [eventTypes setObject:RCT_MAPBOX_REGION_IS_CHANGING forKey:@"RegionIsChanging"];
    [eventTypes setObject:RCT_MAPBOX_REGION_DID_CHANGE forKey:@"RegionDidChange"];
    [eventTypes setObject:RCT_MAPBOX_WILL_START_LOADING_MAP forKey:@"WillStartLoadingMap"];
    [eventTypes setObject:RCT_MAPBOX_DID_FINISH_LOADING_MAP forKey:@"DidFinishLoadingMap"];
    [eventTypes setObject:RCT_MAPBOX_DID_FAIL_LOADING_MAP forKey:@"DidFailLaodingMap"];
    [eventTypes setObject:RCT_MAPBOX_WILL_START_RENDERING_FRAME forKey:@"WillStartRenderingFrame"];
    [eventTypes setObject:RCT_MAPBOX_DID_FINSIH_RENDERING_FRAME forKey:@"DidFinishRenderingFrame"];
    [eventTypes setObject:RCT_MAPBOX_DID_FINISH_RENDERING_FRAME_FULLY forKey:@"DidFinishRenderingFrameFully"];
    [eventTypes setObject:RCT_MAPBOX_WILL_START_RENDERING_MAP forKey:@"WillStartRenderingMap"];
    [eventTypes setObject:RCT_MAPBOX_DID_FINISH_RENDERING_MAP forKey:@"DidFinishRenderingMap"];
    [eventTypes setObject:RCT_MAPBOX_DID_FINISH_RENDERING_MAP_FULLY forKey:@"DidFinishRenderingMapFully"];
    [eventTypes setObject:RCT_MAPBOX_DID_FINISH_LOADING_STYLE forKey:@"DidFinishLoadingStyle"];
    [eventTypes setObject:RCT_MAPBOX_FLY_TO_COMPLETE forKey:@"FlyToComplete"];
    [eventTypes setObject:RCT_MAPBOX_SET_CAMERA_COMPLETE forKey:@"SetCameraComplete"];
    
    // user tracking modes
    NSMutableDictionary *userTrackingModes = [[NSMutableDictionary alloc] init];
    [userTrackingModes setObject:[NSNumber numberWithInt:MGLUserTrackingModeNone] forKey:@"None"];
    [userTrackingModes setObject:[NSNumber numberWithInt:MGLUserTrackingModeFollow] forKey:@"Follow"];
    [userTrackingModes setObject:[NSNumber numberWithInt:MGLUserTrackingModeFollowWithHeading] forKey:@"FollowWithHeading"];
    [userTrackingModes setObject:[NSNumber numberWithInt:MGLUserTrackingModeFollowWithCourse] forKey:@"FollowWithCourse"];
    
    // camera modes
    NSMutableDictionary *cameraModes = [[NSMutableDictionary alloc] init];
    [cameraModes setObject:[NSNumber numberWithInt:RCT_MAPBOX_CAMERA_MODE_FLIGHT] forKey:@"Flight"];
    [cameraModes setObject:[NSNumber numberWithInt:RCT_MAPBOX_CAMERA_MODE_EASE] forKey:@"Ease"];
    [cameraModes setObject:[NSNumber numberWithInt:RCT_MAPBOX_CAMERA_MODE_NONE] forKey:@"None"];
    
    // style sources
    NSMutableDictionary *styleSourceConsts = [[NSMutableDictionary alloc] init];
    [styleSourceConsts setObject:DEFAULT_SOURCE_ID forKey:@"DefaultSourceID"];

    // interpolation modes
    NSMutableDictionary *interpolationModes = [[NSMutableDictionary alloc] init];
    [interpolationModes setObject:@(MGLInterpolationModeExponential) forKey:@"Exponential"];
    [interpolationModes setObject:@(MGLInterpolationModeCategorical) forKey:@"Categorial"];
    [interpolationModes setObject:@(MGLInterpolationModeInterval) forKey:@"Interval"];
    [interpolationModes setObject:@(MGLInterpolationModeIdentity) forKey:@"Identity"];
    
    // line layer constants
    NSMutableDictionary *lineJoin = [[NSMutableDictionary alloc] init];
    [lineJoin setObject:@(MGLLineJoinBevel) forKey:@"Bevel"];
    [lineJoin setObject:@(MGLLineJoinRound) forKey:@"Round"];
    [lineJoin setObject:@(MGLLineJoinMiter) forKey:@"Miter"];
    
    NSMutableDictionary *lineCap = [[NSMutableDictionary alloc] init];
    [lineCap setObject:@(MGLLineCapButt) forKey:@"Butt"];
    [lineCap setObject:@(MGLLineCapRound) forKey:@"Round"];
    [lineCap setObject:@(MGLLineCapSquare) forKey:@"Square"];
    
    return @{
         @"StyleURL": styleURLS,
         @"EventTypes": eventTypes,
         @"UserTrackingModes": userTrackingModes,
         @"CameraModes": cameraModes,
         @"StyleSource": styleSourceConsts,
         @"InterpolationMode": interpolationModes,
         @"LineJoin": lineJoin,
         @"LineCap": lineCap
    };
}

RCT_EXPORT_METHOD(setAccessToken:(NSString *)accessToken)
{
    [MGLAccountManager setAccessToken:accessToken];
}

RCT_EXPORT_METHOD(getAccessToken:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString *accessToken = MGLAccountManager.accessToken;
    
    if (accessToken != nil) {
        resolve(accessToken);
        return;
    }
    
    reject(@"missing_access_token", @"No access token has been set", nil);
}

@end
