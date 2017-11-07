//
//  RCTMGLRasterLayer.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/25/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLRasterLayer.h"
#import "RCTMGLStyle.h"

@implementation RCTMGLRasterLayer

- (MGLStyleLayer*)makeLayer:(MGLStyle*)style
{
    MGLSource *source =  [style sourceWithIdentifier:self.sourceID];
    MGLRasterStyleLayer *layer = [[MGLRasterStyleLayer alloc] initWithIdentifier:self.id source:source];
    return layer;
}

- (void)addStyles
{
    RCTMGLStyle *style = [[RCTMGLStyle alloc] initWithMGLStyle:self.style];
    style.bridge = self.bridge;
    [style rasterLayer:(MGLRasterStyleLayer*)self.styleLayer withReactStyle:self.reactStyle];
}

@end
