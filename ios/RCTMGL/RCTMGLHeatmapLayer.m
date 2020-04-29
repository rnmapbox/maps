//
//  RCTMGLHeatmapLayer.m
//  RCTMGL
//
//  Created by Dheeraj Yalamanchili on 6/8/2019

#import "RCTMGLHeatmapLayer.h"
#import "RCTMGLStyle.h"

@implementation RCTMGLHeatmapLayer

- (MGLHeatmapStyleLayer*)makeLayer:(MGLStyle*)style
{
    MGLSource *source = [self layerWithSourceIDInStyle:style];
    if (source == nil) { return nil; }
    MGLHeatmapStyleLayer *layer = [[MGLHeatmapStyleLayer alloc] initWithIdentifier:self.id source:source];
    layer.sourceLayerIdentifier = self.sourceLayerID;
    return layer;
}

- (void)addStyles
{
    RCTMGLStyle *style = [[RCTMGLStyle alloc] initWithMGLStyle:self.style];
    style.bridge = self.bridge;
    [style heatmapLayer:(MGLHeatmapStyleLayer *)self.styleLayer withReactStyle:self.reactStyle];
}

@end
