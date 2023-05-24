#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface
RCT_EXTERN_REMAP_MODULE(RCTMGLAnimatedPointSource, RCTMGLAnimatedPointSourceManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(id, NSString)
RCT_EXPORT_VIEW_PROPERTY(point, NSString)
RCT_EXPORT_VIEW_PROPERTY(animationDuration, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(snapIfDistanceIsGreaterThan, NSNumber)
@end
