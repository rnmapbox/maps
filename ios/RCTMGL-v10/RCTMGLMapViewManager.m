#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RCTMGLMapView, RCTMGLMapViewManager, RCTViewManager)

RCT_REMAP_VIEW_PROPERTY(styleURL, reactStyleURL, NSString)
RCT_REMAP_VIEW_PROPERTY(onPress, reactOnPress, RCTBubblingEventBlock)
RCT_REMAP_VIEW_PROPERTY(onMapChange, reactOnMapChange, RCTBubblingEventBlock)

RCT_EXTERN_METHOD(takeSnap:(nonnull NSNumber*)reactTag
                  writeToDisk:(BOOL)writeToDisk
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
