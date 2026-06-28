#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "rnmapbox_maps-Swift.pre.h"

#import "rnmapbox_maps_specs.h"

@interface RNMBXChangeLineOffsetsShapeAnimatorModule: NSObject <NativeRNMBXChangeLineOffsetsShapeAnimatorModuleSpec>
@end

@implementation RNMBXChangeLineOffsetsShapeAnimatorModule

RCT_EXPORT_MODULE();

@synthesize viewRegistry_DEPRECATED = _viewRegistry_DEPRECATED;
@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue {
  // It seems that due to how UIBlocks work with uiManager, we need to call the methods there
  // for the blocks to be dispatched before the batch is completed
  return RCTGetUIManagerQueue();
}

RCT_EXPORT_METHOD(create:(nonnull NSNumber*)tag lineString: (nonnull NSArray*)coordinates  startOffset: (nonnull NSNumber*)startOffset endOffset: (nonnull NSNumber*)endOffset resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  resolve([[ChangeLineOffsetsShapeAnimator createWithTag:tag coordinates:coordinates startOffset:startOffset endOffset:endOffset] getTag]);
}

RCT_EXPORT_METHOD(setLineString:(nonnull NSNumber*)tag coordinates: (nonnull NSArray*)coordinates startOffset: (nonnull NSNumber*)startOffset endOffset: (nonnull NSNumber*)endOffset resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  [ChangeLineOffsetsShapeAnimator setLineStringWithTag:tag coordinates:coordinates startOffset:startOffset endOffset:endOffset resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(setStartOffset:(nonnull NSNumber*)tag offset: (nonnull NSNumber*)offset durationMs: (nonnull NSNumber*)durationMs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  [ChangeLineOffsetsShapeAnimator setStartOffsetWithTag:tag offset:offset durationMs:durationMs resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(setEndOffset:(nonnull NSNumber*)tag offset: (nonnull NSNumber*)offset durationMs: (nonnull NSNumber*)durationMs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  [ChangeLineOffsetsShapeAnimator setEndOffsetWithTag:tag offset:offset durationMs:durationMs resolve:resolve reject:reject];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNMBXShapeSourceModuleSpecJSI>(params);
}

@end
