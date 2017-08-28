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
@property (nonatomic, assign) BOOL reactScrollEnabled;
@property (nonatomic, assign) BOOL reactPitchEnabled;

@property (nonatomic, strong) NSDictionary *reactCenterCoordinate;
@property (nonatomic, copy) NSString *reactStyleURL;

@property (nonatomic, assign) double heading;
@property (nonatomic, assign) double pitch;
@property (nonatomic, assign) double reactZoomLevel;
@property (nonatomic, assign) double reactMinZoomLevel;
@property (nonatomic, assign) double reactMaxZoomLevel;

@property (nonatomic, copy) RCTBubblingEventBlock onPress;
@property (nonatomic, copy) RCTBubblingEventBlock onLongPress;
@property (nonatomic, copy) RCTBubblingEventBlock onMapChange;

@end
