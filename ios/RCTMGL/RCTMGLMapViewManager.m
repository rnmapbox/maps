//
//  RCTMGLMapViewManager.m
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLMapViewManager.h"
#import "RCTMGLMapView.h"
#import "RCTConvert+Mapbox.h"

@interface RCTMGLMapViewManager() <MGLMapViewDelegate>
@end


@implementation RCTMGLMapViewManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
    RCTMGLMapView *mapView = [RCTMGLMapView new];
    mapView.delegate = self;
    return mapView;
}

RCT_EXPORT_VIEW_PROPERTY(animated, BOOL)
RCT_REMAP_VIEW_PROPERTY(centerCoordinate, reactCenterCoordinate, NSDictionary)
RCT_REMAP_VIEW_PROPERTY(styleURL, reactStyleURL, NSString)
RCT_EXPORT_VIEW_PROPERTY(heading, double)
RCT_EXPORT_VIEW_PROPERTY(pitch, double)
RCT_REMAP_VIEW_PROPERTY(zoomLevel, reactZoomLevel, double)

@end
