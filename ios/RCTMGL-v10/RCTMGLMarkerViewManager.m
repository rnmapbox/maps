#import "React/RCTBridgeModule.h"
#import <React/RCTViewManager.h>
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_REMAP_MODULE(RCTMGLMarkerView, RCTMGLMarkerViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(coordinate, NSString)

@end

