#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RNMBXAtmosphere, RNMBXAtmosphereViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(reactStyle, NSDictionary);

@end
