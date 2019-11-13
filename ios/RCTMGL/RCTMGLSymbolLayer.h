//
//  RCTMGLSymbolLayer.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/19/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <React/RCTComponent.h>
#import "RCTMGLVectorLayer.h"

@interface RCTMGLSymbolLayer : RCTMGLVectorLayer<RCTInvalidating>

@property (nonatomic, strong) NSMutableArray<id<RCTComponent>> *reactSubviews;

@property (nonatomic, assign) BOOL snapshot;
@property (nonatomic, copy) NSString *sourceLayerID;

@end
