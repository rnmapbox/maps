#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RCTMGLDummyShapeAnimatorManager, RCTViewManager)


RCT_EXPORT_VIEW_PROPERTY(from, NSArray<NSNumber*>)
RCT_EXPORT_VIEW_PROPERTY(to, NSArray<NSNumber*>)

@end
