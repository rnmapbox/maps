//
//  RCTMGLSymbolLayer.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/19/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLSymbolLayer.h"
#import "RCTMGLStyle.h"

@implementation RCTMGLSymbolLayer

- (void)setSourceLayerID:(NSString *)sourceLayerID
{
    _sourceLayerID = sourceLayerID;
    
    if (self.styleLayer != nil) {
        ((MGLSymbolStyleLayer*) self.styleLayer).sourceLayerIdentifier = _sourceLayerID;
    }
}

- (void)addToMap:(MGLStyle *)style
{
    self.style = style;
    self.styleLayer = [self makeLayer:style];
    [self addStyles];
    [self insertLayer];
}

- (MGLSymbolStyleLayer*)makeLayer:(MGLStyle*)style
{
    MGLSource *source = [style sourceWithIdentifier:self.sourceID];
    MGLSymbolStyleLayer *layer = [[MGLSymbolStyleLayer alloc] initWithIdentifier:self.id source:source];
    layer.sourceLayerIdentifier = _sourceLayerID;
    layer.predicate = [self buildFilters];
    return layer;
}

- (void)addStyles
{
    RCTMGLStyle *style = [[RCTMGLStyle alloc] init];
    style.bridge = self.bridge;
    [style symbolLayer:(MGLSymbolStyleLayer*)self.styleLayer withReactStyle:self.reactStyle];
}

@end
