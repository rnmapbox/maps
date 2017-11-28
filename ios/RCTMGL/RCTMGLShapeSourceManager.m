//
//  RCTMGLShapeSourceManager.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/19/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLShapeSourceManager.h"
#import "RCTMGLShapeSource.h"

@implementation RCTMGLShapeSourceManager

RCT_EXPORT_MODULE()

RCT_EXPORT_VIEW_PROPERTY(id, NSString)
RCT_EXPORT_VIEW_PROPERTY(url, NSString)
RCT_EXPORT_VIEW_PROPERTY(shape, NSString)

RCT_EXPORT_VIEW_PROPERTY(cluster, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(clusterRadius, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(clusterMaxZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(maxZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(buffer, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(tolerance, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(images, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(nativeImages, NSArray)
RCT_EXPORT_VIEW_PROPERTY(hasPressListener, BOOL)
RCT_EXPORT_VIEW_PROPERTY(hitbox, NSDictionary)
RCT_REMAP_VIEW_PROPERTY(onMapboxShapeSourcePress, onPress, RCTBubblingEventBlock)

- (UIView*)view
{
    RCTMGLShapeSource *source = [RCTMGLShapeSource new];
    source.bridge = self.bridge;
    return source;
}

@end
