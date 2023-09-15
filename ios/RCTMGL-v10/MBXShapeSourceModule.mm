#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "MBXShapeSourceModule.h"
#ifdef RCT_NEW_ARCH_ENABLED
#import "MBXShapeSourceComponentView.h"
#endif // RCT_NEW_ARCH_ENABLED

// needed for compilation for some reason
#import <CoreFoundation/CoreFoundation.h>
#import <CoreLocation/CoreLocation.h>

@interface MapView : UIView
@end

#import <rnmapbox_maps-Swift.h>


@implementation MBXShapeSourceModule

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

- (void)withPointAnnotation:(NSNumber*)viewRef block:(void (^)(MBXShapeSource *))block reject:(RCTPromiseRejectBlock)reject methodName:(NSString *)methodName
{
#ifdef RCT_NEW_ARCH_ENABLED
    [self.viewRegistry_DEPRECATED addUIBlock:^(RCTViewRegistry *viewRegistry) {
        MBXShapeSourceComponentView *componentView = [self.viewRegistry_DEPRECATED viewForReactTag:viewRef];
        MBXShapeSource *view = componentView.contentView;
        
#else
    [self.bridge.uiManager
     addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        MBXShapeSource *view = [uiManager viewForReactTag:viewRef];
#endif // RCT_NEW_ARCH_ENABLED
        if (view != nil) {
           block(view);
        } else {
            reject(methodName, [NSString stringWithFormat:@"Unknown reactTag: %@", viewRef], nil);
        }
    }];
}


RCT_EXPORT_METHOD(getClusterChildren:(NSNumber *)viewRef featureJSON:(NSString *)featureJSON resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    [self withPointAnnotation:viewRef block:^(MBXShapeSource *view) {
        [MBXShapeSourceViewManager getClusterChildrenWithShapeSource:view featureJSON:featureJSON resolver:resolve rejecter:reject];
    } reject:reject methodName:@"getClusterChildren"];
}
  
RCT_EXPORT_METHOD(getClusterLeaves:(NSNumber *)viewRef featureJSON:(NSString *)featureJSON  number:(double)number offset:(double)offset resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
 [self withPointAnnotation:viewRef block:^(MBXShapeSource *view) {
     [MBXShapeSourceViewManager getClusterLeavesWithShapeSource:view featureJSON:featureJSON number:number offset:offset resolver:resolve rejecter:reject];
 } reject:reject methodName:@"getClusterLeaves"];
}
     
RCT_EXPORT_METHOD(getClusterExpansionZoom:(NSNumber *)viewRef featureJSON:(NSString *)featureJSON resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
 [self withPointAnnotation:viewRef block:^(MBXShapeSource *view) {
     [MBXShapeSourceViewManager getClusterExpansionZoomWithShapeSource:view featureJSON:featureJSON resolver:resolve rejecter:reject];
 } reject:reject methodName:@"getClusterExpansionZoom"];
}

// Thanks to this guard, we won't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeMBXShapeSourceModuleSpecJSI>(params);
}
#endif // RCT_NEW_ARCH_ENABLED

@end
