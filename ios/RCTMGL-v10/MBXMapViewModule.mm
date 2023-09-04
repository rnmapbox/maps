#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "MBXMapViewModule.h"
#import "MBXMapView.h"
#ifdef RCT_NEW_ARCH_ENABLED
#import "MBXMapViewComponentView.h"
#endif // RCT_NEW_ARCH_ENABLED

@implementation MBXMapViewModule

RCT_EXPORT_MODULE();

#ifdef RCT_NEW_ARCH_ENABLED
@synthesize viewRegistry_DEPRECATED = _viewRegistry_DEPRECATED;
#endif // RCT_NEW_ARCH_ENABLED
@synthesize bridge = _bridge;

- (void)withMapComponentView:(NSNumber*)viewRef block:(void (^)(UIView<MBXMapViewProtocol>*))block reject:(RCTPromiseRejectBlock)reject
{
    void (^upperBlock)(void) = ^{
#ifdef RCT_NEW_ARCH_ENABLED
    [self.viewRegistry_DEPRECATED addUIBlock:^(RCTViewRegistry *viewRegistry) {
        UIView<MBXMapViewProtocol> *view = [self.viewRegistry_DEPRECATED viewForReactTag:viewRef];
#else
    [self.bridge.uiManager
     addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView<MBXMapViewProtocol> *view = [uiManager viewForReactTag:viewRef];
#endif // RCT_NEW_ARCH_ENABLED
        if (view != nil) {
           block(view);
        } else {
            reject(@"takeSnap", [NSString stringWithFormat:@"Unknown reactTag: %@", viewRef], nil);
        }
    }];
    };
      if (self.bridge) {
        dispatch_async(RCTGetUIManagerQueue(), upperBlock);
      } else {
        dispatch_async(dispatch_get_main_queue(), upperBlock);
      }
}


RCT_EXPORT_METHOD(takeSnap:(NSNumber*)viewRef writeToDisk:(BOOL)writeToDisk resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    [self withMapComponentView:viewRef block:^(UIView<MBXMapViewProtocol>* view) {
        [view takeSnap:writeToDisk resolve:resolve];
    } reject:reject];
}

RCT_EXPORT_METHOD(clearData:(NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapComponentView:viewRef block:^(UIView<MBXMapViewProtocol>* view) {
        [view clearData:resolve reject:reject];
    } reject:reject];
}


RCT_EXPORT_METHOD(getCenter:(NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapComponentView:viewRef block:^(UIView<MBXMapViewProtocol>* view) {
        [view getCenter:resolve reject:reject];
    } reject:reject];
}


RCT_EXPORT_METHOD(getCoordinateFromView:(NSNumber*)viewRef atPoint:(NSArray *)atPoint resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapComponentView:viewRef block:^(UIView<MBXMapViewProtocol>* view) {
        NSNumber* a = [atPoint objectAtIndex:0];
        NSNumber* b = [atPoint objectAtIndex:1];
        
        [view getCoordinateFromView:CGPointMake(a.floatValue, b.floatValue) resolve:resolve reject:reject];
    } reject:reject];
}


RCT_EXPORT_METHOD(getPointInView:(NSNumber*)viewRef atCoordinate:(NSArray *)atCoordinate resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapComponentView:viewRef block:^(UIView<MBXMapViewProtocol>* view) {
        [view getPointInView:atCoordinate resolve:resolve reject:reject];
    } reject:reject];
}


RCT_EXPORT_METHOD(getVisibleBounds:(NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapComponentView:viewRef block:^(UIView<MBXMapViewProtocol>* view) {
        [view getVisibleBounds:resolve];
    } reject:reject];
}


RCT_EXPORT_METHOD(getZoom:(NSNumber*)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapComponentView:viewRef block:^(UIView<MBXMapViewProtocol>* view) {
        [view getZoom:resolve reject:reject];
    } reject:reject];
}


RCT_EXPORT_METHOD(queryRenderedFeaturesAtPoint:(NSNumber*)viewRef atPoint:(NSArray *)atPoint withFilter:(NSArray *)withFilter withLayerIDs:(NSArray *)withLayerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapComponentView:viewRef block:^(UIView<MBXMapViewProtocol>* view) {
        [view queryRenderedFeaturesAtPoint:atPoint withFilter:withFilter withLayerIDs:withLayerIDs resolve:resolve reject:reject];
    } reject:reject];
}


RCT_EXPORT_METHOD(queryRenderedFeaturesInRect:(NSNumber*)viewRef withBBox:(NSArray *)withBBox withFilter:(NSArray *)withFilter withLayerIDs:(NSArray *)withLayerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapComponentView:viewRef block:^(UIView<MBXMapViewProtocol>* view) {
        [view queryRenderedFeaturesInRect:withBBox withFilter:withFilter withLayerIDs:withLayerIDs resolve:resolve reject:reject];
    } reject:reject];
}


RCT_EXPORT_METHOD(queryTerrainElevation:(NSNumber*)viewRef coordinates:(NSArray *)coordinates resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapComponentView:viewRef block:^(UIView<MBXMapViewProtocol>* view) {
        [view queryTerrainElevation:coordinates resolve:resolve reject:reject];
    } reject:reject];
}


RCT_EXPORT_METHOD(setHandledMapChangedEvents:(nonnull NSNumber*)viewRef events:(NSArray *)events resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapComponentView:viewRef block:^(UIView<MBXMapViewProtocol>* view) {
        [view setHandledMapChangedEvents:events resolve:resolve reject:reject];
    } reject:reject];
}


RCT_EXPORT_METHOD(setSourceVisibility:(NSNumber*)viewRef visible:(BOOL)visible sourceId:(NSString *)sourceId sourceLayerId:(NSString *)sourceLayerId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapComponentView:viewRef block:^(UIView<MBXMapViewProtocol>* view) {
        [view setSourceVisibility:visible sourceId:sourceId sourceLayerId:sourceLayerId resolve:resolve reject:reject];
    } reject:reject];
}

RCT_EXPORT_METHOD(querySourceFeatures:(NSNumber*)viewRef sourceId:(NSString*)sourceId withFilter:(NSArray<id>*)filter withSourceLayerIDs:(NSArray<NSString*>*)sourceLayerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [self withMapComponentView:viewRef block:^(UIView<MBXMapViewProtocol>* view) {
        [view querySourceFeatures:sourceId withFilter:filter withSourceLayerIDs:sourceLayerIDs resolve:resolve reject:reject];
    } reject:reject];
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
