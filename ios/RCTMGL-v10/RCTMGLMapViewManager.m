#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RCTMGLMapView, RCTMGLMapViewManager, RCTViewManager)

RCT_REMAP_VIEW_PROPERTY(styleURL, reactStyleURL, NSString)
RCT_REMAP_VIEW_PROPERTY(onPress, reactOnPress, RCTBubblingEventBlock)
RCT_REMAP_VIEW_PROPERTY(onMapChange, reactOnMapChange, RCTBubblingEventBlock)

RCT_REMAP_VIEW_PROPERTY(zoomEnabled, reactZoomEnabled, BOOL)
RCT_REMAP_VIEW_PROPERTY(scrollEnabled, reactScrollEnabled, BOOL)
RCT_REMAP_VIEW_PROPERTY(rotateEnabled, reactRotateEnabled, BOOL)
RCT_REMAP_VIEW_PROPERTY(pitchEnabled, reactPitchEnabled, BOOL)

RCT_EXTERN_METHOD(takeSnap:(nonnull NSNumber*)reactTag
                  writeToDisk:(BOOL)writeToDisk
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(queryTerrainElevation:(nonnull NSNumber*)reactTag
                  coordinates: (nonnull NSArray<NSNumber>*)coordinates
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setSourceVisibility:(nonnull NSNumber *)reactTag
                  visible:(BOOL)visible
                  sourceId:(nonnull NSString*)sourceId
                  sourceLayerId:(nullable NSString*)sourceLayerId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
