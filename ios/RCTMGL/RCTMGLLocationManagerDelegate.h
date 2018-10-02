//
//  RCTMGLLocationManagerDelegate.h
//  RCTMGL
//
//  Created by Nick Italiano on 6/21/18.
//  Copyright © 2018 Mapbox Inc. All rights reserved.
//

#import <CoreLocation/CoreLocation.h>

#import "RCTMGLLocation.h"

@class RCTMGLLocationManager;

@protocol RCTMGLLocationManagerDelegate<NSObject>

- (void)locationManager:(RCTMGLLocationManager *)locationManager didUpdateLocation:(RCTMGLLocation *)location;

@end

