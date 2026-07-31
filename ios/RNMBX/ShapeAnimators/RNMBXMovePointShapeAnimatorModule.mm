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

// Must match NativeRNMBXMovePointShapeAnimatorModuleSpec exactly (codegen uses NSInteger/double).
- (void)generate:(NSInteger)tag
      coordinate:(NSArray *)coordinate
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject
{
  MovePointShapeAnimator *animator =
      [MovePointShapeAnimator generateWithTag:@(tag) startCoordinate:coordinate];
  if (animator == nil) {
    reject(@"RNMBXMovePointShapeAnimatorModule", @"Failed to generate animator", nil);
    return;
  }
  resolve([animator getTag]);
}

- (void)moveTo:(NSInteger)tag
    coordinate:(NSArray *)coordinate
      duration:(double)duration
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject
{
  [MovePointShapeAnimator moveToTag:@(tag)
                         coordinate:coordinate
                         durationMs:@(duration)
                            resolve:resolve
                             reject:reject];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNMBXMovePointShapeAnimatorModuleSpecJSI>(params);
}

@end
