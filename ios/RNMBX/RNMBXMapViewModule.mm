#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "RNMBXMapViewModule.h"
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNMBXMapViewComponentView.h"
#endif // RCT_NEW_ARCH_ENABLED

#import "rnmapbox_maps-Swift.pre.h"

@implementation RNMBXMapViewModule

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

- (void)withMapView:(nonnull NSNumber*)viewRef block:(void (^)(RNMBXMapView *))block reject:(RCTPromiseRejectBlock)reject methodName:(NSString *)methodName
{
//    void (^upperBlock)(void) = ^{
#ifdef RCT_NEW_ARCH_ENABLED
    [self.viewRegistry_DEPRECATED addUIBlock:^(RCTViewRegistry *viewRegistry) {
        RNMBXMapViewComponentView *componentView = [self.viewRegistry_DEPRECATED viewForReactTag:viewRef];
        RNMBXMapView *view = componentView.contentView;
        
#else
    [self.bridge.uiManager
     addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        RNMBXMapView *view = [uiManager viewForReactTag:viewRef];
#endif // RCT_NEW_ARCH_ENABLED
        if (view != nil) {
           block(view);
        } else {
            reject(methodName, [NSString stringWithFormat:@"Unknown reactTag: %@", viewRef], nil);
        }
    }];
}


RCT_EXPORT_METHOD(takeSnap:(nonnull NSNumber*)viewRef writeToDisk:(BOOL)writeToDisk resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [RNMBXMapViewManager takeSnap:view writeToDisk:writeToDisk resolver:resolve];
    } reject:reject methodName:@"takeSnap"];
}

RCT_EXPORT_METHOD(clearData:(nonnull NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [RNMBXMapViewManager clearData:view resolver:resolve rejecter:reject];
    } reject:reject methodName:@"clearData"];
}


RCT_EXPORT_METHOD(getCenter:(nonnull NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [RNMBXMapViewManager getCenter:view resolver:resolve rejecter:reject];
    } reject:reject methodName:@"getCenter"];
}


RCT_EXPORT_METHOD(getCoordinateFromView:(nonnull NSNumber*)viewRef atPoint:(NSArray *)atPoint resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        NSNumber* a = [atPoint objectAtIndex:0];
        NSNumber* b = [atPoint objectAtIndex:1];
        
        [RNMBXMapViewManager getCoordinateFromView:view atPoint:CGPointMake(a.floatValue, b.floatValue) resolver:resolve rejecter:reject];
    } reject:reject methodName:@"getCoordinateFromView"];
}


RCT_EXPORT_METHOD(getPointInView:(nonnull NSNumber*)viewRef atCoordinate:(NSArray *)atCoordinate resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [RNMBXMapViewManager getPointInView:view atCoordinate:atCoordinate resolver:resolve rejecter:reject];
    } reject:reject methodName:@"getPointInView"];
}


RCT_EXPORT_METHOD(getVisibleBounds:(nonnull NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [RNMBXMapViewManager getVisibleBounds:view resolver:resolve rejecter:reject];
    } reject:reject methodName:@"getVisibleBounds"];
}


RCT_EXPORT_METHOD(getZoom:(nonnull NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [RNMBXMapViewManager getZoom:view resolver:resolve rejecter:reject];
    } reject:reject methodName:@"getZoom"];
}


RCT_EXPORT_METHOD(queryRenderedFeaturesAtPoint:(nonnull NSNumber*)viewRef atPoint:(nonnull NSArray *)atPoint withFilter:(NSArray *)withFilter withLayerIDs:(NSArray *)withLayerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [RNMBXMapViewManager queryRenderedFeaturesAtPoint:view atPoint:atPoint withFilter:withFilter withLayerIDs:withLayerIDs resolver:resolve rejecter:reject];
    } reject:reject methodName:@"queryRenderedFeaturesAtPoint"];
}


RCT_EXPORT_METHOD(queryRenderedFeaturesInRect:(nonnull NSNumber*)viewRef withBBox:(NSArray *)withBBox withFilter:(NSArray *)withFilter withLayerIDs:(NSArray *)withLayerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [RNMBXMapViewManager queryRenderedFeaturesInRect:view withBBox:withBBox withFilter:withFilter withLayerIDs:withLayerIDs resolver:resolve rejecter:reject];
    } reject:reject methodName:@"queryRenderedFeaturesInRect"];
}


RCT_EXPORT_METHOD(queryTerrainElevation:(nonnull NSNumber*)viewRef coordinates:(NSArray *)coordinates resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [RNMBXMapViewManager queryTerrainElevation:view coordinates:coordinates resolver:resolve rejecter:reject];
    } reject:reject methodName:@"queryTerrainElevation"];
}


RCT_EXPORT_METHOD(setHandledMapChangedEvents:(nonnull NSNumber*)viewRef events:(NSArray *)events resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [RNMBXMapViewManager setHandledMapChangedEvents:view events:events resolver:resolve rejecter:reject];
    } reject:reject methodName:@"setHandledMapChangedEvents"];
}


RCT_EXPORT_METHOD(setSourceVisibility:(nonnull NSNumber*)viewRef visible:(BOOL)visible sourceId:(NSString *)sourceId sourceLayerId:(NSString *)sourceLayerId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [RNMBXMapViewManager setSourceVisibility:view visible:visible sourceId:sourceId sourceLayerId:sourceLayerId resolver:resolve rejecter:reject];
    } reject:reject methodName:@"setSourceVisibility"];
}

RCT_EXPORT_METHOD(querySourceFeatures:(nonnull NSNumber*)viewRef sourceId:(NSString*)sourceId withFilter:(NSArray<id>*)withFilter withSourceLayerIDs:(NSArray<NSString*>*)withSourceLayerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapView:viewRef block:^(RNMBXMapView *view) {
        [RNMBXMapViewManager querySourceFeatures:view withSourceId:sourceId withFilter:withFilter withSourceLayerIds:withSourceLayerIDs resolver:resolve rejecter:reject];
    } reject:reject methodName:@"querySourceFeatures"];
}

// Thanks to this guard, we won't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeMapViewModuleSpecJSI>(params);
}
#endif // RCT_NEW_ARCH_ENABLED

@end
