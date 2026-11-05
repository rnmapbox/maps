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
        [view getClusterChildrenWithFeatureJSON:featureJSON resolver:resolve rejecter:reject];
    } reject:reject methodName:@"getClusterChildren"];
}

RCT_EXPORT_METHOD(getClusterLeaves:(nonnull NSNumber *)viewRef featureJSON:(NSString *)featureJSON number:(NSInteger)number offset:(NSInteger)offset resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
 [self withShapeSource:viewRef block:^(RNMBXShapeSource *view) {
     [view getClusterLeavesWithFeatureJSON:featureJSON number:number offset:offset resolver:resolve rejecter:reject];
 } reject:reject methodName:@"getClusterLeaves"];
}

RCT_EXPORT_METHOD(getClusterExpansionZoom:(nonnull NSNumber *)viewRef featureJSON:(NSString *)featureJSON resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
 [self withShapeSource:viewRef block:^(RNMBXShapeSource *view) {
     [view getClusterExpansionZoomWithFeatureJSON:featureJSON resolver:resolve rejecter:reject];
 } reject:reject methodName:@"getClusterExpansionZoom"];
}

RCT_EXPORT_METHOD(addFeatures:(nonnull NSNumber *)viewRef featuresJSON:(NSString *)featuresJSON featureIds:(NSArray *)featureIds shapeRevision:(NSInteger)shapeRevision resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
 NSError *error = nil;
 RNMBXParsedFeatures *features = [RNMBXParsedFeatures parse:featuresJSON error:&error];
 if (features == nil) {
     reject(@"addFeatures", error.localizedDescription, error);
     return;
 }
 [self withShapeSource:viewRef block:^(RNMBXShapeSource *view) {
     [view addFeatures:features featureIds:featureIds shapeRevision:shapeRevision resolver:resolve rejecter:reject];
 } reject:reject methodName:@"addFeatures"];
}

RCT_EXPORT_METHOD(updateFeatures:(nonnull NSNumber *)viewRef featuresJSON:(NSString *)featuresJSON featureIds:(NSArray *)featureIds shapeRevision:(NSInteger)shapeRevision resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
 NSError *error = nil;
 RNMBXParsedFeatures *features = [RNMBXParsedFeatures parse:featuresJSON error:&error];
 if (features == nil) {
     reject(@"updateFeatures", error.localizedDescription, error);
     return;
 }
 [self withShapeSource:viewRef block:^(RNMBXShapeSource *view) {
     [view updateFeatures:features featureIds:featureIds shapeRevision:shapeRevision resolver:resolve rejecter:reject];
 } reject:reject methodName:@"updateFeatures"];
}

RCT_EXPORT_METHOD(removeFeatures:(nonnull NSNumber *)viewRef featureIds:(NSArray *)featureIds shapeRevision:(NSInteger)shapeRevision resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
 [self withShapeSource:viewRef block:^(RNMBXShapeSource *view) {
     [view removeFeaturesWithFeatureIds:featureIds shapeRevision:shapeRevision resolver:resolve rejecter:reject];
 } reject:reject methodName:@"removeFeatures"];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNMBXShapeSourceModuleSpecJSI>(params);
}

@end
