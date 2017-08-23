//
//  MGLModule.m
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "MGLModule.h"
@import Mapbox;

@implementation MGLModule

RCT_EXPORT_MODULE();

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
