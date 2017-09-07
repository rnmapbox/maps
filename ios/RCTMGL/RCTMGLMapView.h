//
//  RCTMGLMapView.h
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <React/RCTComponent.h>
@import Mapbox;

@class CameraUpdateQueue;
@interface RCTMGLMapView : MGLMapView

@property (nonatomic, strong) CameraUpdateQueue *cameraUpdateQueue;

@property (nonatomic, assign) BOOL animated;
@property (nonatomic, assign) BOOL reactScrollEnabled;
@property (nonatomic, assign) BOOL reactPitchEnabled;
@property (nonatomic, assign) BOOL reactShowUserLocation;

@property (nonatomic, copy) NSString *reactCenterCoordinate;
@property (nonatomic, copy) NSString *reactStyleURL;

@property (nonatomic, assign) int reactUserTrackingMode;

@property (nonatomic, assign) double heading;
@property (nonatomic, assign) double pitch;
@property (nonatomic, assign) double reactZoomLevel;
@property (nonatomic, assign) double reactMinZoomLevel;
@property (nonatomic, assign) double reactMaxZoomLevel;

@property (nonatomic, copy) RCTBubblingEventBlock onPress;
@property (nonatomic, copy) RCTBubblingEventBlock onLongPress;
@property (nonatomic, copy) RCTBubblingEventBlock onMapChange;
@property (nonatomic, copy) RCTBubblingEventBlock onUserLocationChange;

- (CLLocationDistance)getMetersPerPixelAtLatitude:(double)latitude withZoom:(double)zoomLevel;
- (CLLocationDistance)altitudeFromZoom:(double)zoomLevel;

@end
