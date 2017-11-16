//
//  RCTMGLFillExtrusionLayerManager.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/15/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLFillExtrusionLayerManager.h"
#import "RCTMGLFillExtrusionLayer.h"

@implementation RCTMGLFillExtrusionLayerManager

RCT_EXPORT_MODULE()

// fill extrusion layer props
RCT_EXPORT_VIEW_PROPERTY(sourceLayerID, NSString);

// standard layer props
RCT_EXPORT_VIEW_PROPERTY(id, NSString);
RCT_EXPORT_VIEW_PROPERTY(sourceID, NSString);
RCT_EXPORT_VIEW_PROPERTY(filter, NSArray);

RCT_EXPORT_VIEW_PROPERTY(aboveLayerID, NSString);
RCT_EXPORT_VIEW_PROPERTY(belowLayerID, NSString);
RCT_EXPORT_VIEW_PROPERTY(layerIndex, NSNumber);
RCT_EXPORT_VIEW_PROPERTY(reactStyle, NSDictionary);

RCT_EXPORT_VIEW_PROPERTY(maxZoomLevel, NSNumber);
RCT_EXPORT_VIEW_PROPERTY(minZoomLevel, NSNumber);

- (UIView*)view
{
    RCTMGLFillExtrusionLayer *layer = [RCTMGLFillExtrusionLayer new];
    layer.bridge = self.bridge;
    return layer;
}

@end
