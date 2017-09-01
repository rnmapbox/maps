//
//  MGLModule.m
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "MGLModule.h"
#import "RCTMGLEventTypes.h"
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
    [userTrackingModes setObject:[NSNumber numberWithInt:MGLUserTrackingModeFollow] forKey:@"Tracking"];
    [userTrackingModes setObject:[NSNumber numberWithInt:MGLUserTrackingModeFollowWithHeading] forKey:@"Compass"];
    [userTrackingModes setObject:[NSNumber numberWithInt:MGLUserTrackingModeFollowWithCourse] forKey:@"Navigation"];
    
    return @{
             @"StyleURL": styleURLS,
             @"EventTypes": eventTypes,
             @"UserTrackingModes": userTrackingModes
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
