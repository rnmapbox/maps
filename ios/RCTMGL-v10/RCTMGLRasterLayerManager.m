#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RCTMGLRasterLayerManager, RCTViewManager)

// symbol layer props
RCT_EXPORT_VIEW_PROPERTY(sourceLayerID, NSString)

// standard layer props
#include "CommonLayerProperties.H"

@end
