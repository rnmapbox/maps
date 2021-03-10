#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RCTMGLMapViewManager, RCTViewManager)
RCT_REMAP_VIEW_PROPERTY(styleURL, reactStyleURL, NSString)
RCT_REMAP_VIEW_PROPERTY(onPress, reactOnPress, RCTBubblingEventBlock)
RCT_REMAP_VIEW_PROPERTY(onMapChange, reactOnMapChange, RCTBubblingEventBlock)
@end
