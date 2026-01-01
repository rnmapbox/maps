#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "RNMBXImageModule.h"
#import "RNMBXImageComponentView.h"

#import "rnmapbox_maps-Swift.pre.h"

@implementation RNMBXImageModule

RCT_EXPORT_MODULE();

@synthesize viewRegistry_DEPRECATED = _viewRegistry_DEPRECATED;
@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
  // It seems that due to how UIBlocks work with uiManager, we need to call the methods there
  // for the blocks to be dispatched before the batch is completed
  return RCTGetUIManagerQueue();
}

- (void)withImage:(nonnull NSNumber*)viewRef block:(void (^)(RNMBXImage *))block reject:(RCTPromiseRejectBlock)reject methodName:(NSString *)methodName
{
    [RNMBXViewResolver withViewRef:viewRef
                          delegate:self
                     expectedClass:[RNMBXImage class]
                             block:^(UIView *view) {
                                 block((RNMBXImage *)view);
                             }
                            reject:reject
                        methodName:methodName];
}


RCT_EXPORT_METHOD(refresh:(nonnull NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    [self withImage:viewRef block:^(RNMBXImage *view) {
        // TODO: implement refresh on iOS
//        [view refresh];
    } reject:reject methodName:@"refresh"];
}


- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNMBXImageModuleSpecJSI>(params);
}

@end
