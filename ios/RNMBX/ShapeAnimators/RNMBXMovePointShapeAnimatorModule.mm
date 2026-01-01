#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "rnmapbox_maps-Swift.pre.h"

#import "rnmapbox_maps_specs.h"

@interface RNMBXMovePointShapeAnimatorModule: NSObject <NativeRNMBXMovePointShapeAnimatorModuleSpec>
@end

@implementation RNMBXMovePointShapeAnimatorModule

RCT_EXPORT_MODULE();

@synthesize viewRegistry_DEPRECATED = _viewRegistry_DEPRECATED;
@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue {
  // It seems that due to how UIBlocks work with uiManager, we need to call the methods there
  // for the blocks to be dispatched before the batch is completed
  return RCTGetUIManagerQueue();
}

RCT_EXPORT_METHOD(generate:(nonnull NSNumber*)tag startCoordinate: (nonnull NSArray*)startCoordinate resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  resolve([[MovePointShapeAnimator generateWithTag:tag startCoordinate:startCoordinate] getTag]);
}

RCT_EXPORT_METHOD(moveTo:(nonnull NSNumber*)tag coordinate: (nonnull NSArray*)coordinate durationMs: (nonnull NSNumber*)durationMs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  [MovePointShapeAnimator moveToTag:tag coordinate:coordinate durationMs:durationMs resolve:resolve reject:reject];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNMBXPointAnnotationModuleSpecJSI>(params);
}

@end
