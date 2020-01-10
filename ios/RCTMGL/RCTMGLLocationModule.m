//
//  RCTMGLLocationManager.m
//  RCTMGL
//
//  Created by Nick Italiano on 6/21/18.
//  Copyright © 2018 Mapbox Inc. All rights reserved.
//

#import <CoreLocation/CoreLocation.h>

#import "RCTMGLLocation.h"
#import "RCTMGLLocationModule.h"
#import "RCTMGLLocationManager.h"
#import "RCTMGLLocationManagerDelegate.h"
#import "RCTMGLEventTypes.h"

@interface RCTMGLLocationModule() <RCTMGLLocationManagerDelegate>
@end

@implementation RCTMGLLocationModule
{
    RCTMGLLocationManager *locationManager;
    BOOL hasListeners;
}

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

- (instancetype)init
{
    if (self = [super init]) {
        locationManager = [[RCTMGLLocationManager alloc] init];
        locationManager.delegate = self;
    }
    return self;
}

- (void)startObserving
{
    [super startObserving];
    hasListeners = YES;
}

- (void)stopObserving
{
    [super stopObserving];
    hasListeners = NO;
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[RCT_MAPBOX_USER_LOCATION_UPDATE];
}

RCT_EXPORT_METHOD(start:(CLLocationDistance)minDisplacement)
{
  [locationManager start:minDisplacement];
}

RCT_EXPORT_METHOD(pause)
{
    [locationManager stop];
}

RCT_EXPORT_METHOD(stop)
{
    [locationManager stop];
}

RCT_EXPORT_METHOD(setMinDisplacement:(CLLocationDistance)minDisplacement)
{
    [locationManager setMinDisplacement:minDisplacement];
}

RCT_EXPORT_METHOD(getLastKnownLocation:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    RCTMGLLocation *lastKnownLocation = [locationManager getLastKnownLocation];
    resolve(lastKnownLocation);
}

- (void)locationManager:(RCTMGLLocationManager *)locationManager didUpdateLocation:(RCTMGLLocation *)location
{
    if (!hasListeners) {
        return;
    }

    if (self.bridge == nil) {
        return;
    }

    [self sendEventWithName:RCT_MAPBOX_USER_LOCATION_UPDATE body:[location toJSON]];
}

@end

