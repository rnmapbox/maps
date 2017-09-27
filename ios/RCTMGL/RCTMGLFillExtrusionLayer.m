//
//  RCTMGLFillExtrusionLayer.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/15/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLFillExtrusionLayer.h"
#import "RCTMGLStyle.h"

@implementation RCTMGLFillExtrusionLayer

- (void)setSourceLayerID:(NSString *)sourceLayerID
{
    _sourceLayerID = sourceLayerID;
    
    if (self.styleLayer != nil) {
        ((MGLFillExtrusionStyleLayer*) self.styleLayer).sourceLayerIdentifier = _sourceLayerID;
    }
}

- (void)addToMap:(MGLStyle *)style
{
    self.style = style;
    self.styleLayer = [self makeLayer:style];
    [self addStyles];
    [self insertLayer];
}

- (MGLFillExtrusionStyleLayer*)makeLayer:(MGLStyle*)style
{
    MGLSource *source = [style sourceWithIdentifier:self.sourceID];
    MGLFillExtrusionStyleLayer *layer = [[MGLFillExtrusionStyleLayer alloc] initWithIdentifier:self.id source:source];
    layer.sourceLayerIdentifier = _sourceLayerID;
    layer.predicate = [self buildFilters];
    return layer;
}

- (void)addStyles
{
    RCTMGLStyle *style = [[RCTMGLStyle alloc] initWithMGLStyle:self.style];
    style.bridge = self.bridge;
    [style fillExtrusionLayer:(MGLFillExtrusionStyleLayer*)self.styleLayer withReactStyle:self.reactStyle];
}

@end
