//
//  RCTMGLShapeSource.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/19/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTSource.h"
@import Mapbox;

@interface RCTMGLShapeSource : RCTSource

@property (nonatomic, copy) NSString *url;
@property (nonatomic, copy) NSString *shape;

@property (nonatomic, assign) NSNumber *cluster;
@property (nonatomic, assign) NSNumber *clusterRadius;
@property (nonatomic, assign) NSNumber *clusterMaxZoom;

@property (nonatomic, assign) NSNumber *maxZoom;
@property (nonatomic, assign) NSNumber *buffer;
@property (nonatomic, assign) NSNumber *tolerence;

@end
