#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "RNMBXShapeSourceModule.h"
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNMBXShapeSourceComponentView.h"
#endif // RCT_NEW_ARCH_ENABLED

#import "rnmapbox_maps-Swift.pre.h"

@implementation RNMBXShapeSourceModule

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

- (void)withShapeSource:(nonnull NSNumber*)viewRef block:(void (^)(RNMBXShapeSource *))block reject:(RCTPromiseRejectBlock)reject methodName:(NSString *)methodName
{
#ifdef RCT_NEW_ARCH_ENABLED
    [self.viewRegistry_DEPRECATED addUIBlock:^(RCTViewRegistry *viewRegistry) {
        RNMBXShapeSourceComponentView *componentView = [self.viewRegistry_DEPRECATED viewForReactTag:viewRef];
        RNMBXShapeSource *view = componentView.contentView;
        
#else
    [self.bridge.uiManager
     addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        RNMBXShapeSource *view = [uiManager viewForReactTag:viewRef];
#endif // RCT_NEW_ARCH_ENABLED
        if (view != nil) {
           block(view);
        } else {
            reject(methodName, [NSString stringWithFormat:@"Unknown reactTag: %@", viewRef], nil);
        }
    }];
}


RCT_EXPORT_METHOD(getClusterChildren:(nonnull NSNumber *)viewRef featureJSON:(NSString *)featureJSON resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    [self withShapeSource:viewRef block:^(RNMBXShapeSource *view) {
        [RNMBXShapeSourceViewManager getClusterChildrenWithShapeSource:view featureJSON:featureJSON resolver:resolve rejecter:reject];
    } reject:reject methodName:@"getClusterChildren"];
}
  
RCT_EXPORT_METHOD(getClusterLeaves:(nonnull NSNumber *)viewRef featureJSON:(NSString *)featureJSON  number:(double)number offset:(double)offset resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
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

// Thanks to this guard, we won't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNMBXShapeSourceModuleSpecJSI>(params);
}
#endif // RCT_NEW_ARCH_ENABLED

@end
