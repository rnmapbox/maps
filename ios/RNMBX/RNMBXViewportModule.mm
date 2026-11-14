#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "RNMBXViewportModule.h"
#import "RNMBXViewportComponentView.h"

#import "rnmapbox_maps-Swift.pre.h"

@implementation RNMBXViewportModule

RCT_EXPORT_MODULE();

@synthesize viewRegistry_DEPRECATED = _viewRegistry_DEPRECATED;
@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
  // It seems that due to how UIBlocks work with uiManager, we need to call the methods there
  // for the blocks to be dispatched before the batch is completed
  return RCTGetUIManagerQueue();
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNMBXViewportModuleSpecJSI>(params);
}

- (void)withViewport:(nonnull NSNumber*)viewRef block:(void (^)(RNMBXViewport *))block reject:(RCTPromiseRejectBlock)reject methodName:(NSString *)methodName
{
    [RNMBXViewResolver withViewRef:viewRef
                          delegate:self
                     expectedClass:[RNMBXViewport class]
                             block:^(UIView *view) {
                                 block((RNMBXViewport *)view);
                             }
                            reject:reject
                        methodName:methodName];
}

RCT_EXPORT_METHOD(getState:(nonnull NSNumber *)viewRef
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject)
{
    [self withViewport:viewRef block:^(RNMBXViewport *view) {
        resolve([view getState]);
    } reject:reject methodName:@"getState"];
}
     
RCT_EXPORT_METHOD(idle:(nonnull NSNumber *)viewRef
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject)
{
   [self withViewport:viewRef block:^(RNMBXViewport *view) {
       [view idle];
       resolve(nil);
   } reject:reject methodName:@"idle"];
}

RCT_EXPORT_METHOD(transitionTo:(nonnull NSNumber *)viewRef
                  state: (NSDictionary*)state
                  transition: (NSDictionary*) transition
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self withViewport:viewRef block:^(RNMBXViewport *view) {
    [view transitionToState:state transition:transition resolve:resolve];
  } reject:reject methodName:@"transitionTo"];
}

@end
