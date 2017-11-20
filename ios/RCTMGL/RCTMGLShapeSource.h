//
//  RCTMGLShapeSource.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/19/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <React/RCTBridge.h>
#import "RCTMGLSource.h"

@import Mapbox;

@interface RCTMGLShapeSource : RCTMGLSource

@property (nonatomic, weak) RCTBridge *bridge;

@property (nonatomic, copy) NSString *url;
@property (nonatomic, copy) NSString *shape;
@property (nonatomic, strong) NSDictionary<NSString *, NSString *> *images;
@property (nonatomic, strong) NSArray<NSString *> *nativeImages;

@property (nonatomic, assign) NSNumber *cluster;
@property (nonatomic, assign) NSNumber *clusterRadius;
@property (nonatomic, assign) NSNumber *clusterMaxZoomLevel;

@property (nonatomic, assign) NSNumber *maxZoomLevel;
@property (nonatomic, assign) NSNumber *buffer;
@property (nonatomic, assign) NSNumber *tolerence;

@property (nonatomic, copy) RCTBubblingEventBlock onPress;
@property (nonatomic, assign) BOOL hasPressListener;

@end
