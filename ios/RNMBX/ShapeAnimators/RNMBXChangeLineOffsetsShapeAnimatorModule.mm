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

// Must match NativeRNMBXChangeLineOffsetsShapeAnimatorModuleSpec exactly (codegen uses NSInteger/double).
- (void)generate:(NSInteger)tag
     coordinates:(NSArray *)coordinates
     startOffset:(double)startOffset
       endOffset:(double)endOffset
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject
{
  ChangeLineOffsetsShapeAnimator *animator =
      [ChangeLineOffsetsShapeAnimator createWithTag:@(tag)
                                        coordinates:coordinates
                                        startOffset:@(startOffset)
                                          endOffset:@(endOffset)];
  if (animator == nil) {
    reject(@"RNMBXChangeLineOffsetsShapeAnimatorModule", @"Failed to generate animator", nil);
    return;
  }
  resolve([animator getTag]);
}

- (void)setLineString:(NSInteger)tag
          coordinates:(NSArray *)coordinates
          startOffset:(double)startOffset
            endOffset:(double)endOffset
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
  [ChangeLineOffsetsShapeAnimator setLineStringWithTag:@(tag)
                                           coordinates:coordinates
                                           startOffset:@(startOffset)
                                             endOffset:@(endOffset)
                                               resolve:resolve
                                                reject:reject];
}

- (void)setStartOffset:(NSInteger)tag
                offset:(double)offset
              duration:(double)duration
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject
{
  [ChangeLineOffsetsShapeAnimator setStartOffsetWithTag:@(tag)
                                                 offset:@(offset)
                                             durationMs:@(duration)
                                                resolve:resolve
                                                 reject:reject];
}

- (void)setEndOffset:(NSInteger)tag
              offset:(double)offset
            duration:(double)duration
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
  [ChangeLineOffsetsShapeAnimator setEndOffsetWithTag:@(tag)
                                               offset:@(offset)
                                           durationMs:@(duration)
                                              resolve:resolve
                                               reject:reject];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNMBXChangeLineOffsetsShapeAnimatorModuleSpecJSI>(params);
}

@end
