#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "RNMBXMapViewModule.h"
#import "RNMBXMapViewComponentView.h"

#import "rnmapbox_maps-Swift.pre.h"
#import "RNMBXViewResolver.h"

@implementation RNMBXMapViewModule

RCT_EXPORT_MODULE();

@synthesize viewRegistry_DEPRECATED = _viewRegistry_DEPRECATED;
@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
  // It seems that due to how UIBlocks work with uiManager, we need to call the methods there
  // for the blocks to be dispatched before the batch is completed
  return RCTGetUIManagerQueue();
}

- (void)withMapView:(nonnull NSNumber*)viewRef block:(void (^)(RNMBXMapView *))block reject:(RCTPromiseRejectBlock)reject methodName:(NSString *)methodName
{
    [RNMBXViewResolver withViewRef:viewRef
                    delegate:self
                    expectedClass:[RNMBXMapView class]
                    block:^(UIView *view) {
                        block((RNMBXMapView *)view);
                    }
                    reject:reject
                    methodName:methodName];
}

RCT_EXPORT_METHOD(takeSnap:(nonnull NSNumber*)viewRef writeToDisk:(BOOL)writeToDisk resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view takeSnapWithWriteToDisk:writeToDisk resolver:resolve];
    } reject:reject methodName:@"takeSnap"];
}

RCT_EXPORT_METHOD(clearData:(nonnull NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view clearDataWithResolver:resolve rejecter:reject];
    } reject:reject methodName:@"clearData"];
}


RCT_EXPORT_METHOD(getCenter:(nonnull NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view getCenterWithResolver:resolve rejecter:reject];
    } reject:reject methodName:@"getCenter"];
}


RCT_EXPORT_METHOD(getCoordinateFromView:(nonnull NSNumber*)viewRef atPoint:(NSArray *)atPoint resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        NSNumber* a = [atPoint objectAtIndex:0];
        NSNumber* b = [atPoint objectAtIndex:1];

        [view getCoordinateFromViewWithAtPoint:CGPointMake(a.floatValue, b.floatValue) resolver:resolve rejecter:reject];
    } reject:reject methodName:@"getCoordinateFromView"];
}


RCT_EXPORT_METHOD(getPointInView:(nonnull NSNumber*)viewRef atCoordinate:(NSArray *)atCoordinate resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view getPointInViewWithAtCoordinate:atCoordinate resolver:resolve rejecter:reject];
    } reject:reject methodName:@"getPointInView"];
}


RCT_EXPORT_METHOD(getVisibleBounds:(nonnull NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view getVisibleBoundsWithResolver:resolve rejecter:reject];
    } reject:reject methodName:@"getVisibleBounds"];
}


RCT_EXPORT_METHOD(getZoom:(nonnull NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view getZoomWithResolver:resolve rejecter:reject];
    } reject:reject methodName:@"getZoom"];
}


RCT_EXPORT_METHOD(queryRenderedFeaturesAtPoint:(nonnull NSNumber*)viewRef atPoint:(nonnull NSArray *)atPoint withFilter:(NSArray *)withFilter withLayerIDs:(NSArray *)withLayerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view queryRenderedFeaturesAtPointWithAtPoint:atPoint withFilter:withFilter withLayerIDs:withLayerIDs resolver:resolve rejecter:reject];
    } reject:reject methodName:@"queryRenderedFeaturesAtPoint"];
}


RCT_EXPORT_METHOD(queryRenderedFeaturesInRect:(nonnull NSNumber*)viewRef withBBox:(NSArray *)withBBox withFilter:(NSArray *)withFilter withLayerIDs:(NSArray *)withLayerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view queryRenderedFeaturesInRectWithBBox:withBBox withFilter:withFilter withLayerIDs:withLayerIDs resolver:resolve rejecter:reject];
    } reject:reject methodName:@"queryRenderedFeaturesInRect"];
}


RCT_EXPORT_METHOD(queryTerrainElevation:(nonnull NSNumber*)viewRef coordinates:(NSArray *)coordinates resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view queryTerrainElevationWithCoordinates:coordinates resolver:resolve rejecter:reject];
    } reject:reject methodName:@"queryTerrainElevation"];
}


RCT_EXPORT_METHOD(setHandledMapChangedEvents:(nonnull NSNumber*)viewRef events:(NSArray *)events resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view setHandledMapChangedEventsWithEvents:events resolver:resolve rejecter:reject];
    } reject:reject methodName:@"setHandledMapChangedEvents"];
}


RCT_EXPORT_METHOD(setSourceVisibility:(nonnull NSNumber*)viewRef visible:(BOOL)visible sourceId:(NSString *)sourceId sourceLayerId:(NSString *)sourceLayerId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view setSourceVisibilityWithVisible:visible sourceId:sourceId sourceLayerId:sourceLayerId resolver:resolve rejecter:reject];
    } reject:reject methodName:@"setSourceVisibility"];
}

RCT_EXPORT_METHOD(setFeatureState:(nonnull NSNumber*)viewRef featureId:(nonnull NSString *)featureId state:(nonnull NSDictionary<NSString*,id> *)state sourceId:(NSString *)sourceId sourceLayerId:(NSString *)sourceLayerId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view setFeatureStateWithFeatureId:featureId state:state sourceId:sourceId sourceLayerId:sourceLayerId resolver:resolve rejecter:reject];
    } reject:reject methodName:@"setFeatureState"];
}

RCT_EXPORT_METHOD(getFeatureState:(nonnull NSNumber*)viewRef featureId:(nonnull NSString *)featureId sourceId:(nonnull NSString *)sourceId sourceLayerId:(NSString *)sourceLayerId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view getFeatureStateWithFeatureId:featureId sourceId:sourceId sourceLayerId:sourceLayerId resolver:resolve rejecter:reject];
    } reject:reject methodName:@"getFeatureState"];
}

RCT_EXPORT_METHOD(removeFeatureState:(nonnull NSNumber*)viewRef featureId:(nonnull NSString *)featureId stateKey:(NSString*)stateKey sourceId:(NSString *)sourceId sourceLayerId:(NSString *)sourceLayerId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view removeFeatureStateWithFeatureId:featureId stateKey:stateKey sourceId:sourceId sourceLayerId:sourceLayerId resolver:resolve rejecter:reject];
    } reject:reject methodName:@"removeFeatureState"];
}

RCT_EXPORT_METHOD(querySourceFeatures:(nonnull NSNumber*)viewRef sourceId:(NSString*)sourceId withFilter:(NSArray<id>*)withFilter withSourceLayerIDs:(NSArray<NSString*>*)withSourceLayerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [view querySourceFeaturesWithSourceId:sourceId withFilter:withFilter withSourceLayerIds:withSourceLayerIDs resolver:resolve rejecter:reject];
    } reject:reject methodName:@"querySourceFeatures"];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeMapViewModuleSpecJSI>(params);
}

@end
