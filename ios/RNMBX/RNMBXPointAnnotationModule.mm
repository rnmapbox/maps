#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "RNMBXPointAnnotationModule.h"
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNMBXPointAnnotationComponentView.h"
#endif // RCT_NEW_ARCH_ENABLED

#import "rnmapbox_maps-Swift.pre.h"

@implementation RNMBXPointAnnotationModule

RCT_EXPORT_MODULE();

#ifdef RCT_NEW_ARCH_ENABLED
@synthesize viewRegistry_DEPRECATED = _viewRegistry_DEPRECATED;
#endif // RCT_NEW_ARCH_ENABLED
@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
  // It seems that due to how UIBlocks work with uiManager, we need to call the methods there
  // for the blocks to be dispatched before the batch is completed
  return RCTGetUIManagerQueue();
}

- (void)withPointAnnotation:(nonnull NSNumber*)viewRef block:(void (^)(RNMBXPointAnnotation *))block reject:(RCTPromiseRejectBlock)reject methodName:(NSString *)methodName
{
#ifdef RCT_NEW_ARCH_ENABLED
    [self.viewRegistry_DEPRECATED addUIBlock:^(RCTViewRegistry *viewRegistry) {
        RNMBXPointAnnotationComponentView *componentView = [self.viewRegistry_DEPRECATED viewForReactTag:viewRef];
        RNMBXPointAnnotation *view = componentView.contentView;
        
#else
    [self.bridge.uiManager
     addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        RNMBXPointAnnotation *view = [uiManager viewForReactTag:viewRef];
#endif // RCT_NEW_ARCH_ENABLED
        if (view != nil) {
           block(view);
        } else {
            reject(methodName, [NSString stringWithFormat:@"Unknown reactTag: %@", viewRef], nil);
        }
    }];
}


RCT_EXPORT_METHOD(refresh:(nonnull NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    [self withPointAnnotation:viewRef block:^(RNMBXPointAnnotation *view) {
        [view refresh];
    } reject:reject methodName:@"refresh"];
}


// Thanks to this guard, we won't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNMBXPointAnnotationModuleSpecJSI>(params);
}
#endif // RCT_NEW_ARCH_ENABLED

@end
