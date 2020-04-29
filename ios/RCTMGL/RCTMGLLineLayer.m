//
//  RCTMGLLineLayer.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/18/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLLineLayer.h"
#import "RCTMGLStyle.h"
#import <React/RCTLog.h>

@implementation RCTMGLLineLayer

- (MGLLineStyleLayer*)makeLayer:(MGLStyle*)style
{
    MGLSource *source = [self layerWithSourceIDInStyle:style];
    if (source == nil) { return nil; }
    MGLLineStyleLayer *layer = [[MGLLineStyleLayer alloc] initWithIdentifier:self.id source:source];
    layer.sourceLayerIdentifier = self.sourceLayerID;
    return layer;
}

- (void)addStyles
{
    RCTMGLStyle *style = [[RCTMGLStyle alloc] initWithMGLStyle:self.style];
    style.bridge = self.bridge;
    [style lineLayer:(MGLLineStyleLayer *)self.styleLayer withReactStyle:self.reactStyle];
}

@end
