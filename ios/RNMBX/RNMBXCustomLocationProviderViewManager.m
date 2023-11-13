#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RNMBXCustomLocationProvider, RNMBXCustomLocationProviderViewManager, RCTViewManager)

// circle layer props
RCT_EXPORT_VIEW_PROPERTY(coordinate, NSArray)

@end
