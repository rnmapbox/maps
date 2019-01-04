//
//  RCTMGLRasterSource.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/25/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLSource.h"
@import Mapbox;

@interface RCTMGLRasterSource : RCTMGLSource

@property (nonatomic, copy) NSString *url;
@property (nonatomic, copy) NSString *attribution;

@property (nonatomic, strong) NSNumber *tileSize;
@property (nonatomic, strong) NSNumber *minZoomLevel;
@property (nonatomic, strong) NSNumber *maxZoomLevel;

@property (nonatomic, assign) BOOL tms;

@end
