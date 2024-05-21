#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "RNMBXCameraModule.h"
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNMBXCameraComponentView.h"
#endif // RCT_NEW_ARCH_ENABLED

#import "rnmapbox_maps-Swift.pre.h"

@implementation RNMBXCameraModule

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

// Thanks to this guard, we won't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNMBXCameraModuleSpecJSI>(params);
}
#endif // RCT_NEW_ARCH_ENABLED

- (void)withCamera:(nonnull NSNumber*)viewRef block:(void (^)(RNMBXCamera *))block reject:(RCTPromiseRejectBlock)reject methodName:(NSString *)methodName
{
#ifdef RCT_NEW_ARCH_ENABLED
    [self.viewRegistry_DEPRECATED addUIBlock:^(RCTViewRegistry *viewRegistry) {
    RNMBXCameraComponentView *componentView = [self.viewRegistry_DEPRECATED viewForReactTag:viewRef];
        RNMBXCamera *view = componentView.contentView;
        
#else
    [self.bridge.uiManager
     addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        RNMBXCamera *view = [uiManager viewForReactTag:viewRef];
#endif // RCT_NEW_ARCH_ENABLED
        if (view != nil) {
           block(view);
        } else {
            reject(methodName, [NSString stringWithFormat:@"Unknown reactTag: %@", viewRef], nil);
        }
    }];
}

RCT_EXPORT_METHOD(updateCameraStop:(nonnull NSNumber *)viewRef
                  stop: (NSDictionary*)stop
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject)
{
    [self withCamera:viewRef block:^(RNMBXCamera *view) {
        [view updateCameraStop: stop];
        resolve(@true);
    } reject:reject methodName:@"someMethod"];
}

@end
