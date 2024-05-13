#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "rnmapbox_maps-Swift.pre.h"

#ifdef RCT_NEW_ARCH_ENABLED
#import "rnmapbox_maps_specs.h"
#else
#import <React/RCTBridge.h>
#endif

@interface RNMBXMovePointShapeAnimatorModule: NSObject
#ifdef RCT_NEW_ARCH_ENABLED
<NativeRNMBXMovePointShapeAnimatorModuleSpec>
#else
<RCTBridgeModule>
#endif
@end

@implementation RNMBXMovePointShapeAnimatorModule

RCT_EXPORT_MODULE();

#ifdef RCT_NEW_ARCH_ENABLED
@synthesize viewRegistry_DEPRECATED = _viewRegistry_DEPRECATED;
#endif // RCT_NEW_ARCH_ENABLED
@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue {
  // It seems that due to how UIBlocks work with uiManager, we need to call the methods there
  // for the blocks to be dispatched before the batch is completed
  return RCTGetUIManagerQueue();
}

RCT_EXPORT_METHOD(create:(nonnull NSNumber*)tag startCoordinate: (nonnull NSArray*)startCoordinate resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  resolve([[MovePointShapeAnimator createWithTag:tag startCoordinate:startCoordinate] getTag]);
}

RCT_EXPORT_METHOD(moveTo:(nonnull NSNumber*)tag coordinate: (nonnull NSArray*)coordinate durationMs: (nonnull NSNumber*)durationMs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  [MovePointShapeAnimator moveToTag:tag coordinate:coordinate durationMs:durationMs resolve:resolve reject:reject];
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
