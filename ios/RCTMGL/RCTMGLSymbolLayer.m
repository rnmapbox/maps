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

- (void)updateFilter:(NSPredicate *)predicate
{
    ((MGLSymbolStyleLayer *) self.styleLayer).predicate = predicate;
}

- (void)setSourceLayerID:(NSString *)sourceLayerID
{
    _sourceLayerID = sourceLayerID;
    
    if (self.styleLayer != nil) {
        ((MGLSymbolStyleLayer*) self.styleLayer).sourceLayerIdentifier = _sourceLayerID;
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

- (MGLSymbolStyleLayer*)makeLayer:(MGLStyle*)style
{
    MGLSource *source = [style sourceWithIdentifier:self.sourceID];
    MGLSymbolStyleLayer *layer = [[MGLSymbolStyleLayer alloc] initWithIdentifier:self.id source:source];
    layer.sourceLayerIdentifier = _sourceLayerID;
    return layer;
}

- (void)addStyles
{
    RCTMGLStyle *style = [[RCTMGLStyle alloc] initWithMGLStyle:self.style];
    style.bridge = self.bridge;
    [style symbolLayer:(MGLSymbolStyleLayer*)self.styleLayer withReactStyle:self.reactStyle];
}

@end
