//
//  RCTMGLFillLayer.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/8/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLFillLayer.h"
#import "RCTMGLStyle.h"

@implementation RCTMGLFillLayer

- (MGLStyleLayer*)makeLayer:(MGLStyle*)style
{
    MGLSource *source = [style sourceWithIdentifier:self.sourceID];
    MGLFillStyleLayer *layer = [[MGLFillStyleLayer alloc] initWithIdentifier:self.id source:source];
    layer.predicate = [self buildFilters];
    return layer;
}

- (void)addStyles
{
    RCTMGLStyle *style = [[RCTMGLStyle alloc] init];
    style.bridge = self.bridge;
    [style fillLayer:(MGLFillStyleLayer*)self.styleLayer withReactStyle:self.reactStyle];
}

@end
