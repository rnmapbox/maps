#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RNMBXNativeUserLocation, RNMBXNativeUserLocationViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(iosShowsUserHeadingIndicator, BOOL);

@end

