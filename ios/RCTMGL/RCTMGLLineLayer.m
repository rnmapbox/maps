//
//  RCTMGLLineLayer.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/18/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLLineLayer.h"
#import "RCTMGLStyle.h"

@implementation RCTMGLLineLayer

- (void)setSourceLayerID:(NSString *)sourceLayerID
{
    _sourceLayerID = sourceLayerID;
    
    if (self.styleLayer != nil) {
        ((MGLLineStyleLayer*) self.styleLayer).sourceLayerIdentifier = _sourceLayerID;
    }
}

- (void)addToMap:(MGLStyle *)style
{
    self.style = style;
    self.styleLayer = [self makeLayer:style];
    [self addStyles];
    [self insertLayer];
}

- (MGLLineStyleLayer*)makeLayer:(MGLStyle*)style
{
    MGLSource *source = [style sourceWithIdentifier:self.sourceID];
    MGLLineStyleLayer *layer = [[MGLLineStyleLayer alloc] initWithIdentifier:self.id source:source];
    layer.sourceLayerIdentifier = _sourceLayerID;
    layer.predicate = [self buildFilters];
    return layer;
}

- (void)addStyles
{
    RCTMGLStyle *style = [[RCTMGLStyle alloc] init];
    style.bridge = self.bridge;
    [style lineLayer:(MGLLineStyleLayer *)self.styleLayer withReactStyle:self.reactStyle];
}

@end
