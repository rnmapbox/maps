#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RNMBXLight, RNMBXLightViewManager, RCTViewManager)

// light props
RCT_EXPORT_VIEW_PROPERTY(reactStyle, NSDictionary);

@end
