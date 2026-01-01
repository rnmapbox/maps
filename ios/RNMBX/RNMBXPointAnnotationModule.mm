#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "RNMBXPointAnnotationModule.h"
#import "RNMBXPointAnnotationComponentView.h"

#import "rnmapbox_maps-Swift.pre.h"

@implementation RNMBXPointAnnotationModule

RCT_EXPORT_MODULE();

@synthesize viewRegistry_DEPRECATED = _viewRegistry_DEPRECATED;
@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
  // It seems that due to how UIBlocks work with uiManager, we need to call the methods there
  // for the blocks to be dispatched before the batch is completed
  return RCTGetUIManagerQueue();
}

- (void)withPointAnnotation:(nonnull NSNumber*)viewRef block:(void (^)(RNMBXPointAnnotation *))block reject:(RCTPromiseRejectBlock)reject methodName:(NSString *)methodName
{
    [RNMBXViewResolver withViewRef:viewRef
                          delegate:self
                     expectedClass:[RNMBXPointAnnotation class]
                             block:^(UIView *view) {
                                 block((RNMBXPointAnnotation *)view);
                             }
                            reject:reject
                        methodName:methodName];
}


RCT_EXPORT_METHOD(refresh:(nonnull NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    [self withPointAnnotation:viewRef block:^(RNMBXPointAnnotation *view) {
        [view refresh];
    } reject:reject methodName:@"refresh"];
}


- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNMBXPointAnnotationModuleSpecJSI>(params);
}

@end
