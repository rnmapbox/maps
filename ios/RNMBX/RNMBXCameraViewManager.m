#import "React/RCTBridgeModule.h"
#import <React/RCTViewManager.h>
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_REMAP_MODULE(RNMBXCamera, RNMBXCameraViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(maxBounds, NSString)
RCT_EXPORT_VIEW_PROPERTY(animationDuration, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(animationMode, NSString)
RCT_EXPORT_VIEW_PROPERTY(defaultStop, NSDictionary)

RCT_EXPORT_VIEW_PROPERTY(followUserLocation, BOOL)
RCT_EXPORT_VIEW_PROPERTY(followUserMode, NSString)
RCT_EXPORT_VIEW_PROPERTY(followZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(followPitch, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(followHeading, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(followPadding, NSDictionary)

RCT_EXPORT_VIEW_PROPERTY(maxZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(minZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(onUserTrackingModeChange, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(stop, NSDictionary)

@end
