//
//  RCTMGLCircleLayer.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/18/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLCircleLayer.h"
#import "RCTMGLStyle.h"

@implementation RCTMGLCircleLayer

- (void)updateFilter:(NSPredicate *)predicate
{
    ((MGLCircleStyleLayer *) self.styleLayer).predicate = predicate;
}

- (void)setSourceLayerID:(NSString *)sourceLayerID
{
    _sourceLayerID = sourceLayerID;
    
    if (self.styleLayer != nil) {
        ((MGLCircleStyleLayer*) self.styleLayer).sourceLayerIdentifier = _sourceLayerID;
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

- (MGLCircleStyleLayer*)makeLayer:(MGLStyle*)style
{
    MGLSource *source = [style sourceWithIdentifier:self.sourceID];
    MGLCircleStyleLayer *layer = [[MGLCircleStyleLayer alloc] initWithIdentifier:self.id source:source];
    layer.sourceLayerIdentifier = _sourceLayerID;
    return layer;
}

- (void)addStyles
{
    RCTMGLStyle *style = [[RCTMGLStyle alloc] initWithMGLStyle:self.style];
    style.bridge = self.bridge;
    [style circleLayer:(MGLCircleStyleLayer*)self.styleLayer withReactStyle:self.reactStyle];
}

@end
