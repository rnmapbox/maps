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

@property (nonatomic, strong) NSNumber *cluster;
@property (nonatomic, strong) NSNumber *clusterRadius;
@property (nonatomic, strong) NSNumber *clusterMaxZoomLevel;

@property (nonatomic, strong) NSNumber *maxZoomLevel;
@property (nonatomic, strong) NSNumber *buffer;
@property (nonatomic, strong) NSNumber *tolerance;

@property (nonatomic, copy) RCTBubblingEventBlock onPress;
@property (nonatomic, assign) BOOL hasPressListener;

- (nonnull NSArray<id <MGLFeature>> *)featuresMatchingPredicate:(nullable NSPredicate *)predicate;
- (nonnull NSArray<id <MGLFeature>> *)getClusterLeaves:(nonnull NSNumber *)clusterId
                                                number:(NSUInteger)number
                                                offset:(NSUInteger)offset;

- (double)getClusterExpansionZoom:(nonnull NSNumber *)clusterId;

@end
