#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RNMBXLightManager, RCTViewManager)

// light props
RCT_EXPORT_VIEW_PROPERTY(reactStyle, NSDictionary);

@end
