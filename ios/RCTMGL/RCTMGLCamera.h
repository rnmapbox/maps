//
//  RCTMGLCamera.h
//  RCTMGL
//
//  Created by Nick Italiano on 6/22/18.
//  Copyright © 2018 Mapbox Inc. All rights reserved.
//
#import <React/RCTComponent.h>
#import <UIKit/UIKit.h>
#import "RCTMGLMapView.h"

@class RCTMGLMapView;

@interface RCTMGLCamera : UIView<RCTMGLMapViewCamera>

@property (nonatomic, strong) NSDictionary<NSString *, id> *stop;
@property (nonatomic, strong) NSDictionary<NSString *, id> *defaultStop;
@property (nonatomic, strong) RCTMGLMapView *map;

@property (nonatomic, copy) NSNumber *animationDuration;
@property (nonatomic, copy) NSString *animationMode;

@property (nonatomic, assign) BOOL followUserLocation;
@property (nonatomic, copy) NSString *followUserMode;
@property (nonatomic, copy) NSNumber *followZoomLevel;
@property (nonatomic, copy) NSNumber *followPitch;
@property (nonatomic, copy) NSNumber *followHeading;

@property (nonatomic, copy) NSNumber *maxZoomLevel;
@property (nonatomic, copy) NSNumber *minZoomLevel;

@property (nonatomic, copy) NSString *maxBounds;

@property (nonatomic, copy) NSString *alignment;
@property (nonatomic, copy, readonly) NSNumber *cameraAnimationMode;

@property (nonatomic, copy) RCTBubblingEventBlock onUserTrackingModeChange;

@end
