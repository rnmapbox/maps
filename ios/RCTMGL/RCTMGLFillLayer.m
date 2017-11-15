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

- (void)updateFilter:(NSPredicate *)predicate
{
    ((MGLFillStyleLayer *) self.styleLayer).predicate = predicate;
}

- (void)setSourceLayerID:(NSString *)sourceLayerID
{
    _sourceLayerID = sourceLayerID;
    
    if (self.styleLayer != nil) {
        ((MGLFillStyleLayer *) self.styleLayer).sourceLayerIdentifier = _sourceLayerID;
    }
}

- (void)addToMap:(MGLStyle *)style
{
    [super addToMap:style];
    
    NSPredicate *filter = [self buildFilters];
    if (filter != nil) {
        [self updateFilter:filter];
    }
}

- (MGLStyleLayer*)makeLayer:(MGLStyle*)style
{
    MGLSource *source = [style sourceWithIdentifier:self.sourceID];
    MGLFillStyleLayer *layer = [[MGLFillStyleLayer alloc] initWithIdentifier:self.id source:source];
    layer.sourceLayerIdentifier = _sourceLayerID;
    return layer;
}

- (void)addStyles
{
    RCTMGLStyle *style = [[RCTMGLStyle alloc] initWithMGLStyle:self.style];
    style.bridge = self.bridge;
    [style fillLayer:(MGLFillStyleLayer*)self.styleLayer withReactStyle:self.reactStyle];
}

@end
