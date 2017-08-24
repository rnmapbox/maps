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
    // setup map gesture recongizers
    UITapGestureRecognizer *tap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(didTapMap:)];
    UILongPressGestureRecognizer *longPress = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(didLongPressMap:)];
    
    RCTMGLMapView *mapView = [RCTMGLMapView new];
    mapView.delegate = self;
    [mapView addGestureRecognizer:tap];
    [mapView addGestureRecognizer:longPress];
    return mapView;
}

RCT_EXPORT_VIEW_PROPERTY(animated, BOOL)
RCT_REMAP_VIEW_PROPERTY(centerCoordinate, reactCenterCoordinate, NSDictionary)
RCT_REMAP_VIEW_PROPERTY(styleURL, reactStyleURL, NSString)
RCT_EXPORT_VIEW_PROPERTY(heading, double)
RCT_EXPORT_VIEW_PROPERTY(pitch, double)
RCT_REMAP_VIEW_PROPERTY(zoomLevel, reactZoomLevel, double)

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onLongPress, RCTBubblingEventBlock)

- (void)didTapMap:(UITapGestureRecognizer *)recognizer
{
    RCTMGLMapView *mapView = (RCTMGLMapView*)recognizer.view;
    
    if (mapView == nil || mapView.onPress == nil) {
        return;
    }
    
    mapView.onPress([self convertXYPointToGeoJSONPoint:mapView atPoint:[recognizer locationInView:mapView]]);
}

- (void)didLongPressMap:(UILongPressGestureRecognizer *)recognizer
{
    RCTMGLMapView *mapView = (RCTMGLMapView*)recognizer.view;
    
    if (mapView == nil || mapView.onPress == nil) {
        return;
    }
    
    mapView.onLongPress([self convertXYPointToGeoJSONPoint:mapView atPoint:[recognizer locationInView:mapView]]);
}

- (NSDictionary*)convertXYPointToGeoJSONPoint:(RCTMGLMapView*)mapView atPoint:(CGPoint)point
{
    CLLocationCoordinate2D coord = [mapView convertPoint:point toCoordinateFromView:mapView];
    return @{
              @"type": @"Point",
              @"coordinates": @[[NSNumber numberWithDouble:coord.longitude], [NSNumber numberWithDouble:coord.latitude]]
            };
}

@end
