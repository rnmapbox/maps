#import "React/RCTBridgeModule.h"
#import <React/RCTViewManager.h>
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_MODULE(RCTMGLCameraManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(stop, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(defaultStop, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(followUserLocation, BOOL)

@end
