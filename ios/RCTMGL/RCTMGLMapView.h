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
@class RCTMGLImages;
@class RCTMGLLogging;

@protocol RCTMGLMapViewCamera<NSObject>
- (void)initialLayout;
- (void)didChangeUserTrackingMode:(MGLUserTrackingMode)mode animated:(BOOL)animated;
@end

typedef void (^FoundLayerBlock) (MGLStyleLayer* __nonnull layer);
typedef void (^StyleLoadedBlock) (MGLStyle* __nonnull style);

@interface RCTMGLMapView : MGLMapView<RCTInvalidating>

@property (nonatomic, strong, nonnull) RCTMGLLogging* logging;
@property (nonatomic, strong) CameraUpdateQueue *cameraUpdateQueue;
@property (nonatomic, weak) id<RCTMGLMapViewCamera> reactCamera;
@property (nonatomic, strong) NSMutableArray<id<RCTComponent>> *reactSubviews;
@property (nonatomic, strong) NSMutableArray<RCTMGLSource*> *sources;
@property (nonatomic, strong) NSMutableArray<RCTMGLImages*> *images;
@property (nonatomic, strong) NSMutableArray<RCTMGLLayer*> *layers;
@property (nonatomic, strong) NSMutableArray<RCTMGLPointAnnotation*> *pointAnnotations;
@property (nonatomic, strong) RCTMGLLight *light;
@property (nonatomic, copy) NSArray<NSNumber *> *reactContentInset;

@property (nonatomic, strong) NSMutableDictionary<NSString*, NSMutableArray<FoundLayerBlock>*> *layerWaiters;
@property (nonatomic, strong) NSMutableArray<StyleLoadedBlock> *styleWaiters;

@property (nonatomic, assign) BOOL reactLocalizeLabels;
@property (nonatomic, assign) BOOL reactScrollEnabled;
@property (nonatomic, assign) BOOL reactPitchEnabled;
@property (nonatomic, assign) BOOL reactRotateEnabled;
@property (nonatomic, assign) BOOL reactAttributionEnabled;
@property (nonatomic, strong) NSDictionary<NSString *, NSNumber *> *reactAttributionPosition;
@property (nonatomic, assign) BOOL reactLogoEnabled;
@property (nonatomic, assign) BOOL reactCompassEnabled;
@property (nonatomic, assign) BOOL reactZoomEnabled;

@property (nonatomic, assign) NSInteger *reactCompassViewPosition;
@property (nonatomic, assign) CGPoint reactCompassViewMargins;

@property (nonatomic, copy) NSString *reactStyleURL;
@property (nonatomic, assign) NSInteger reactPreferredFramesPerSecond;

@property (nonatomic, assign) MGLCoordinateBounds maxBounds;

@property (nonatomic, assign) BOOL isUserInteraction;
@property (nonatomic, assign) BOOL useNativeUserLocationAnnotationView;

@property (nonatomic, copy) RCTBubblingEventBlock onPress;
@property (nonatomic, copy) RCTBubblingEventBlock onLongPress;
@property (nonatomic, copy) RCTBubblingEventBlock onMapChange;


- (void)layerAdded:(MGLStyleLayer*) layer;

- (CLLocationDistance)getMetersPerPixelAtLatitude:(double)latitude withZoom:(double)zoomLevel;
- (CLLocationDistance)altitudeFromZoom:(double)zoomLevel;
- (CLLocationDistance)altitudeFromZoom:(double)zoomLevel atLatitude:(CLLocationDegrees)latitude;
- (CLLocationDistance)altitudeFromZoom:(double)zoomLevel atLatitude:(CLLocationDegrees)latitude atPitch:(CGFloat)pitch;
- (RCTMGLPointAnnotation*)getRCTPointAnnotation:(MGLPointAnnotation*)mglAnnotation;
- (NSArray<RCTMGLSource *> *)getAllTouchableSources;
- (NSArray<RCTMGLSource *> *)getAllShapeSources;
- (NSArray<RCTMGLImages *> *)getAllImages;
- (RCTMGLSource *)getTouchableSourceWithHighestZIndex:(NSArray<RCTMGLSource *> *)touchableSources;
- (NSString *)takeSnap:(BOOL)writeToDisk;
- (void)didChangeUserTrackingMode:(MGLUserTrackingMode)mode animated:(BOOL)animated;

- (void)waitForLayerWithID:(nonnull NSString*)layerID then:(void (^ _Nonnull)(MGLStyleLayer* _Nonnull layer))foundLayer;

- (void)setSourceVisibility:(BOOL)visiblity sourceId:(nonnull NSString*)sourceId sourceLayerId:(nullable NSString*)sourceLayerId;

- (void)notifyStyleLoaded;

@end
