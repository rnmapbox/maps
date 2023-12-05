#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RNMBXNativeUserLocation, RNMBXNativeUserLocationViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(iosShowsUserHeadingIndicator, BOOL);
RCT_EXPORT_VIEW_PROPERTY(topImage, NSString);
RCT_EXPORT_VIEW_PROPERTY(bearingImage, NSString);
RCT_EXPORT_VIEW_PROPERTY(shadowImage, NSString);
RCT_EXPORT_VIEW_PROPERTY(scale, NSArray);
RCT_EXPORT_VIEW_PROPERTY(visible, BOOL);
RCT_EXPORT_VIEW_PROPERTY(puckBearing, NSString);
RCT_EXPORT_VIEW_PROPERTY(puckBearingEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(pulsing, NSDictionary);

@end

