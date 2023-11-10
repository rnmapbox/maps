#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "RNMBXViewportModule.h"
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNMBXViewportComponentView.h"
#endif // RCT_NEW_ARCH_ENABLED

#import "rnmapbox_maps-Swift.pre.h"

@implementation RNMBXViewportModule

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
    return std::make_shared<facebook::react::NativeRNMBXViewportModuleSpecJSI>(params);
}
#endif // RCT_NEW_ARCH_ENABLED

- (void)withViewport:(nonnull NSNumber*)viewRef block:(void (^)(RNMBXViewport *))block reject:(RCTPromiseRejectBlock)reject methodName:(NSString *)methodName
{
#ifdef RCT_NEW_ARCH_ENABLED
    [self.viewRegistry_DEPRECATED addUIBlock:^(RCTViewRegistry *viewRegistry) {
    RNMBXViewportComponentView *componentView = [self.viewRegistry_DEPRECATED viewForReactTag:viewRef];
        RNMBXViewport *view = componentView.contentView;
        
#else
    [self.bridge.uiManager
     addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        RNMBXViewport *view = [uiManager viewForReactTag:viewRef];
#endif // RCT_NEW_ARCH_ENABLED
        if (view != nil) {
           block(view);
        } else {
            reject(methodName, [NSString stringWithFormat:@"Unknown reactTag: %@", viewRef], nil);
        }
    }];
}

RCT_EXPORT_METHOD(getState:(nonnull NSNumber *)viewRef
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject)
{
    [self withViewport:viewRef block:^(RNMBXViewport *view) {
        [RNMBXViewportManager getState:view resolve:resolve reject:reject];
    } reject:reject methodName:@"getState"];
}
     
RCT_EXPORT_METHOD(idle:(nonnull NSNumber *)viewRef
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject)
{
   [self withViewport:viewRef block:^(RNMBXViewport *view) {
       [RNMBXViewportManager idle:view resolve:resolve reject:reject];
   } reject:reject methodName:@"idle"];
}

RCT_EXPORT_METHOD(transitionTo:(nonnull NSNumber *)viewRef
                  state: (NSDictionary*)state
                  transition: (NSDictionary*) transition
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self withViewport:viewRef block:^(RNMBXViewport *view) {
      [RNMBXViewportManager transitionTo:view state:state transition:transition
        resolve:resolve reject:reject];
  } reject:reject methodName:@"idle"];
}

@end
