#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(MBXLight, MBXLightViewManager, RCTViewManager)

// light props
RCT_EXPORT_VIEW_PROPERTY(reactStyle, NSDictionary);

@end
