#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RNMBXNativeUserLocationManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(iosShowsUserHeadingIndicator, BOOL);
RCT_EXPORT_VIEW_PROPERTY(topImage, NSString);
RCT_EXPORT_VIEW_PROPERTY(bearingImage, NSString);
RCT_EXPORT_VIEW_PROPERTY(shadowImage, NSString);
RCT_EXPORT_VIEW_PROPERTY(scale, NSNumber);

@end

