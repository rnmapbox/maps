//
//  RCTMGLMapView.h
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <React/RCTComponent.h>
#import "RCTMGLSource.h"
#import "RCTMGLShapeSource.h"
#import "RCTMGLPointAnnotation.h"
#import "RCTMGLLight.h"

@import Mapbox;

@class CameraUpdateQueue;

@interface RCTMGLMapView : MGLMapView<RCTInvalidating>

@property (nonatomic, strong) CameraUpdateQueue *cameraUpdateQueue;
@property (nonatomic, strong) NSMutableArray<id<RCTComponent>> *reactSubviews;
@property (nonatomic, strong) NSMutableArray<RCTMGLSource*> *sources;
@property (nonatomic, strong) NSMutableArray<RCTMGLPointAnnotation*> *pointAnnotations;
@property (nonatomic, strong) RCTMGLLight *light;
@property (nonatomic, copy) NSArray<NSNumber *> *reactContentInset;

@property (nonatomic, assign) BOOL animated;
@property (nonatomic, assign) BOOL reactLocalizeLabels;
@property (nonatomic, assign) BOOL reactScrollEnabled;
@property (nonatomic, assign) BOOL reactPitchEnabled;
@property (nonatomic, assign) BOOL reactRotateEnabled;
@property (nonatomic, assign) BOOL reactAttributionEnabled;
@property (nonatomic, assign) BOOL reactLogoEnabled;
@property (nonatomic, assign) BOOL reactCompassEnabled;
@property (nonatomic, assign) BOOL reactShowUserLocation;
@property (nonatomic, assign) BOOL reactZoomEnabled;

@property (nonatomic, copy) NSString *reactCenterCoordinate;
@property (nonatomic, copy) NSString *reactStyleURL;

@property (nonatomic, assign) BOOL isUserInteraction;
@property (nonatomic, assign) int reactUserTrackingMode;
@property (nonatomic, assign) int reactUserLocationVerticalAlignment;

@property (nonatomic, assign) double heading;
@property (nonatomic, assign) double pitch;
@property (nonatomic, assign) double reactZoomLevel;
@property (nonatomic, assign) double reactMinZoomLevel;
@property (nonatomic, assign) double reactMaxZoomLevel;

@property (nonatomic, copy) RCTBubblingEventBlock onPress;
@property (nonatomic, copy) RCTBubblingEventBlock onLongPress;
@property (nonatomic, copy) RCTBubblingEventBlock onMapChange;
@property (nonatomic, copy) RCTBubblingEventBlock onUserTrackingModeChange;

- (CLLocationDistance)getMetersPerPixelAtLatitude:(double)latitude withZoom:(double)zoomLevel;
- (CLLocationDistance)altitudeFromZoom:(double)zoomLevel;
- (RCTMGLPointAnnotation*)getRCTPointAnnotation:(MGLPointAnnotation*)mglAnnotation;
- (NSArray<RCTMGLSource *> *)getAllTouchableSources;
- (RCTMGLSource *)getTouchableSourceWithHighestZIndex:(NSArray<RCTMGLSource *> *)touchableSources;
- (NSString *)takeSnap:(BOOL)writeToDisk;

@end
