#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "RNMBXShapeSourceModule.h"
#import "RNMBXShapeSourceComponentView.h"

#import "rnmapbox_maps-Swift.pre.h"

@implementation RNMBXShapeSourceModule

RCT_EXPORT_MODULE();

@synthesize viewRegistry_DEPRECATED = _viewRegistry_DEPRECATED;
@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
  // It seems that due to how UIBlocks work with uiManager, we need to call the methods there
  // for the blocks to be dispatched before the batch is completed
  return RCTGetUIManagerQueue();
}

- (void)withShapeSource:(nonnull NSNumber*)viewRef block:(void (^)(RNMBXShapeSource *))block reject:(RCTPromiseRejectBlock)reject methodName:(NSString *)methodName
{
    [RNMBXViewResolver withViewRef:viewRef
                          delegate:self
                     expectedClass:[RNMBXShapeSource class]
                             block:^(UIView *view) {
                                 block((RNMBXShapeSource *)view);
                             }
                            reject:reject
                        methodName:methodName];
}


RCT_EXPORT_METHOD(getClusterChildren:(nonnull NSNumber *)viewRef featureJSON:(NSString *)featureJSON resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    [self withShapeSource:viewRef block:^(RNMBXShapeSource *view) {
        [RNMBXShapeSourceViewManager getClusterChildrenWithShapeSource:view featureJSON:featureJSON resolver:resolve rejecter:reject];
    } reject:reject methodName:@"getClusterChildren"];
}
  
RCT_EXPORT_METHOD(getClusterLeaves:(nonnull NSNumber *)viewRef featureJSON:(NSString *)featureJSON number:(NSInteger)number offset:(NSInteger)offset resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
 [self withShapeSource:viewRef block:^(RNMBXShapeSource *view) {
     [RNMBXShapeSourceViewManager getClusterLeavesWithShapeSource:view featureJSON:featureJSON number:number offset:offset resolver:resolve rejecter:reject];
 } reject:reject methodName:@"getClusterLeaves"];
}
     
RCT_EXPORT_METHOD(getClusterExpansionZoom:(nonnull NSNumber *)viewRef featureJSON:(NSString *)featureJSON resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
 [self withShapeSource:viewRef block:^(RNMBXShapeSource *view) {
     [RNMBXShapeSourceViewManager getClusterExpansionZoomWithShapeSource:view featureJSON:featureJSON resolver:resolve rejecter:reject];
 } reject:reject methodName:@"getClusterExpansionZoom"];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNMBXShapeSourceModuleSpecJSI>(params);
}

@end
