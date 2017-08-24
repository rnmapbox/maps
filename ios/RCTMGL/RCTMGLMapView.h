//
//  RCTMGLMapView.h
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <React/RCTComponent.h>
@import Mapbox;

@interface RCTMGLMapView : MGLMapView

@property (nonatomic, assign) BOOL animated;
@property (nonatomic, assign) NSDictionary *reactCenterCoordinate;
@property (nonatomic, assign) NSString *reactStyleURL;

@property (nonatomic, assign) double heading;
@property (nonatomic, assign) double pitch;
@property (nonatomic, assign) double reactZoomLevel;

@property (nonatomic, copy) RCTBubblingEventBlock onPress;
@property (nonatomic, copy) RCTBubblingEventBlock onLongPress;

@end
