#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface
RCT_EXTERN_REMAP_MODULE(RCTMGLLineSource, RCTMGLLineSourceManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(id, NSString)
RCT_EXPORT_VIEW_PROPERTY(lineString, NSString)
RCT_EXPORT_VIEW_PROPERTY(startOffset, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(endOffset, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(animationDuration, NSNumber)
@end
