#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RNMBXViewport, RNMBXViewportManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(transitionsToIdleUponUserInteraction, NSNumber)

RCT_EXPORT_VIEW_PROPERTY(hasStatusChanged, BOOL)

RCT_EXPORT_VIEW_PROPERTY(onStatusChanged, RCTBubblingEventBlock)

@end
