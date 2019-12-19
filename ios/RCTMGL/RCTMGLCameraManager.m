//
//  RCTMGLCameraManager.m
//  RCTMGL
//
//  Created by Nick Italiano on 6/22/18.
//  Copyright © 2018 Mapbox Inc. All rights reserved.
//

#import "RCTMGLCameraManager.h"
#import "RCTMGLCamera.h"

@implementation RCTMGLCameraManager

RCT_EXPORT_MODULE(RCTMGLCamera)

#pragma - View Properties

RCT_EXPORT_VIEW_PROPERTY(stop, NSDictionary)

RCT_EXPORT_VIEW_PROPERTY(animationDuration, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(animationMode, NSString)

RCT_EXPORT_VIEW_PROPERTY(followUserLocation, BOOL)
RCT_EXPORT_VIEW_PROPERTY(followUserMode, NSString)
RCT_EXPORT_VIEW_PROPERTY(followZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(followPitch, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(followHeading, NSNumber)

RCT_EXPORT_VIEW_PROPERTY(alignment, NSString)

RCT_EXPORT_VIEW_PROPERTY(maxBounds, NSString)

RCT_EXPORT_VIEW_PROPERTY(maxZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(minZoomLevel, NSNumber)

RCT_EXPORT_VIEW_PROPERTY(onUserTrackingModeChange, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(defaultStop, NSDictionary)

#pragma Methods

- (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (UIView *)view
{
    return [[RCTMGLCamera alloc] init];
}

@end
