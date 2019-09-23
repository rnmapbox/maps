//
//  RCTMGLRasterSource.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/25/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLTileSource.h"
@import Mapbox;

@interface RCTMGLRasterSource : RCTMGLTileSource

@property (nonatomic, strong) NSNumber *tileSize;

@end
