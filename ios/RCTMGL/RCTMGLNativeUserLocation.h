//
//  RCTMGLCamera.h
//  RCTMGL
//
//  Created by Nick Italiano on 6/22/18.
//  Copyright © 2018 Mapbox Inc. All rights reserved.
//
#import <React/RCTComponent.h>
#import <UIKit/UIKit.h>

@class RCTMGLMapView;

@interface RCTMGLNativeUserLocation : UIView

@property (nonatomic, strong) RCTMGLMapView *map;
@property (nonatomic) BOOL iosShowsUserHeadingIndicator;

@end
