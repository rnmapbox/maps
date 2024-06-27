/***
to: ios/rnmbx/generated/RNMBXLocationManager.m
***/
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RNMBXLocation, RNMBXLocationManager, RCTViewManager)


  RCT_EXPORT_VIEW_PROPERTY(onBearingChange, RCTBubblingEventBlock)

  RCT_EXPORT_VIEW_PROPERTY(onLocationChange, RCTBubblingEventBlock)


  RCT_EXPORT_VIEW_PROPERTY(hasOnBearingChange, BOOL)

  RCT_EXPORT_VIEW_PROPERTY(hasOnLocationChange, BOOL)


@end
