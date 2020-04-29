//
//  RCTMGLFillExtrusionLayer.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/15/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLFillExtrusionLayer.h"
#import "RCTMGLStyle.h"
#import <React/RCTLog.h>

@implementation RCTMGLFillExtrusionLayer

- (MGLFillExtrusionStyleLayer*)makeLayer:(MGLStyle*)style
{
    MGLSource *source = [self layerWithSourceIDInStyle:style];
    if (source == nil) { return nil; }
    MGLFillExtrusionStyleLayer *layer = [[MGLFillExtrusionStyleLayer alloc] initWithIdentifier:self.id source:source];
    layer.sourceLayerIdentifier = self.sourceLayerID;
    return layer;
}

- (void)addStyles
{
    RCTMGLStyle *style = [[RCTMGLStyle alloc] initWithMGLStyle:self.style];
    style.bridge = self.bridge;
    [style fillExtrusionLayer:(MGLFillExtrusionStyleLayer*)self.styleLayer withReactStyle:self.reactStyle];
}

@end
