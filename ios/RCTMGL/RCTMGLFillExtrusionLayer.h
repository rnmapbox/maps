//
//  RCTMGLFillExtrusionLayer.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/15/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLLayer.h"
@import Mapbox;

@interface RCTMGLFillExtrusionLayer<MGLFillExtrusionStyleLayer> : RCTMGLLayer

@property (nonatomic, copy) NSString *sourceLayerID;

@end
