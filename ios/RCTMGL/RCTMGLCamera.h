//
//  RCTMGLCamera.h
//  RCTMGL
//
//  Created by Nick Italiano on 6/22/18.
//  Copyright © 2018 Mapbox Inc. All rights reserved.
//

#import <UIKit/UIKit.h>

@class RCTMGLMapView;

@interface RCTMGLCamera : UIView

@property (nonatomic, strong) NSDictionary<NSString *, id> *stop;
@property (nonatomic, strong) RCTMGLMapView *map;

@property (nonatomic, copy) NSNumber *animationDuration;
@property (nonatomic, copy) NSString *animationMode;

@property (nonatomic, assign) BOOL followUserLocation;
@property (nonatomic, copy) NSString *followUserMode;
@property (nonatomic, copy) NSNumber *followZoomLevel;
@property (nonatomic, copy) NSNumber *followPitch;
@property (nonatomic, copy) NSNumber *followHeading;

@property (nonatomic, copy) NSString *alignment;
@property (nonatomic, copy, readonly) NSNumber *cameraAnimationMode;

@end
