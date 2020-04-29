//
//  RCTMGLCircleLayer.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/18/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLCircleLayer.h"
#import "RCTMGLStyle.h"

#import <React/RCTLog.h>

@implementation RCTMGLCircleLayer

- (MGLCircleStyleLayer*)makeLayer:(MGLStyle*)style
{
    MGLSource *source = [self layerWithSourceIDInStyle:style];
    if (source == nil) { return nil; }
    MGLCircleStyleLayer *layer = [[MGLCircleStyleLayer alloc] initWithIdentifier:self.id source:source];
    layer.sourceLayerIdentifier = self.sourceLayerID;
    return layer;
}

- (void)addStyles
{
    RCTMGLStyle *style = [[RCTMGLStyle alloc] initWithMGLStyle:self.style];
    style.bridge = self.bridge;
    [style circleLayer:(MGLCircleStyleLayer*)self.styleLayer withReactStyle:self.reactStyle];
}

@end
