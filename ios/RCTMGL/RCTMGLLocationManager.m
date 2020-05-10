//
//  RCTMGLLocationManager.m
//  RCTMGL
//
//  Created by Nick Italiano on 6/21/18.
//  Copyright © 2018 Mapbox Inc. All rights reserved.
//

#import <CoreLocation/CoreLocation.h>
#import "RCTMGLLocationManager.h"

@interface RCTMGLLocationManager()<CLLocationManagerDelegate>
@end

@implementation RCTMGLLocationManager
{
    CLLocationManager *locationManager;
    CLLocation *lastKnownLocation;
    CLHeading *lastKnownHeading;
    CLLocationDistance displacement;
    NSMutableArray<RCTMGLLocationBlock> *listeners;
    BOOL isListening;
}

+ (id)sharedInstance
{
    static RCTMGLLocationManager *manager = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{ manager = [[self alloc] init]; });
    return manager;
}

- (instancetype)init
{
    if (self = [super init]) {
        [self _setupLocationManager];
        listeners = [[NSMutableArray alloc] init];
        displacement = 0.0;
    }
    return self;
}

- (void)dealloc
{
    locationManager.delegate = nil;
    [self stop];
}

- (void)start:(CLLocationDistance)minDisplacement
{

    displacement = minDisplacement;

    if ([self isEnabled]) {
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        [self->locationManager requestWhenInUseAuthorization];
        [self->locationManager startUpdatingLocation];
        [self->locationManager startUpdatingHeading];
        [self->locationManager setDistanceFilter:(minDisplacement)];
        self->isListening = YES;
    });
}

- (void)setMinDisplacement:(CLLocationDistance)minDisplacement
{

    displacement = minDisplacement;

    dispatch_async(dispatch_get_main_queue(), ^{
        [self->locationManager setDistanceFilter:(minDisplacement)];
    });
}

- (void)stop
{
    if (![self isEnabled]) {
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        [self->locationManager stopUpdatingLocation];
        [self->locationManager stopUpdatingHeading];
        self->isListening = NO;
    });
}

- (BOOL)isEnabled
{
    return isListening;
}

- (RCTMGLLocation *)getLastKnownLocation
{
    CLLocation* newLastLocation = locationManager.location;
    if (newLastLocation) {
      lastKnownLocation = newLastLocation;
    }
    RCTMGLLocation *location = [self _convertToMapboxLocation:lastKnownLocation];
    return location;
}

- (void)addListener:(RCTMGLLocationBlock)listener
{
    if (![listeners containsObject:listener]) {
        [listeners addObject:listener];
    }
}

- (void)removeListener:(RCTMGLLocationBlock)listener
{
    NSUInteger indexOf = [listeners indexOfObject:listener];

    if (indexOf == NSNotFound) {
        return;
    }

    [listeners removeObjectAtIndex:indexOf];
}

- (void)locationManager:(CLLocationManager *)manager didUpdateHeading:(CLHeading *)heading
{
    lastKnownHeading = heading;

    if (displacement > 0) {
      return;
    }

    [self _updateDelegate];
}

- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations
{
    lastKnownLocation = [locations lastObject];
    [self _updateDelegate];
}

- (void)_setupLocationManager
{
    __weak RCTMGLLocationManager *weakSelf = self;

    dispatch_async(dispatch_get_main_queue(), ^{
        self->locationManager = [[CLLocationManager alloc] init];
        self->locationManager.delegate = weakSelf;
    });
}

- (void)_updateDelegate
{
    if (_delegate == nil) {
        return;
    }

    RCTMGLLocation *userLocation = [self _convertToMapboxLocation:lastKnownLocation];

    if (listeners.count > 0) {
        for (int i = 0; i < listeners.count; i++) {
            RCTMGLLocationBlock listener = listeners[i];
            listener(userLocation);
        }
    }

    [_delegate locationManager:self didUpdateLocation:userLocation];
}

- (RCTMGLLocation *)_convertToMapboxLocation:(CLLocation *)location
{
    if (location == nil) {
        return nil;
    }

    RCTMGLLocation *userLocation = [[RCTMGLLocation alloc] init];
    userLocation.location = location;
    userLocation.heading = lastKnownHeading;
    return userLocation;
}

@end
