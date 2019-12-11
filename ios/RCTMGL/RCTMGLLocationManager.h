//
//  RCTMGLLocationManager.h
//  RCTMGL
//
//  Created by Nick Italiano on 6/21/18.
//  Copyright © 2018 Mapbox Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

#import "RCTMGLLocation.h"
#import "RCTMGLLocationManagerDelegate.h"

typedef void (^RCTMGLLocationBlock)(RCTMGLLocation *location);

@interface RCTMGLLocationManager : NSObject

@property (nonatomic, strong) id<RCTMGLLocationManagerDelegate> delegate;

+ (id)sharedInstance;

- (void)start:(CLLocationDistance)minDisplacement;
- (void)stop;
- (void)setMinDisplacement:(CLLocationDistance)minDisplacement;
- (BOOL)isEnabled;
- (RCTMGLLocation *)getLastKnownLocation;
- (void)addListener:(RCTMGLLocationBlock)listener;
- (void)removeListener:(RCTMGLLocationBlock)listener;

@end
