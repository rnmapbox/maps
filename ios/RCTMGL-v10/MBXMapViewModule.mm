#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXMapViewModule.h"
#import "MBXMapViewComponentView.h"

@implementation MBXMapViewModule

RCT_EXPORT_MODULE();

#ifdef RCT_NEW_ARCH_ENABLED
@synthesize viewRegistry_DEPRECATED = _viewRegistry_DEPRECATED;
#endif // RCT_NEW_ARCH_ENABLED
@synthesize bridge = _bridge;

- (void)withMapComponentView:(NSNumber*)viewRef block:(void (^)(MBXMapViewComponentView*))block reject:(RCTPromiseRejectBlock)reject
{
    dispatch_async(dispatch_get_main_queue(), ^{
        MBXMapViewComponentView* view = [self.viewRegistry_DEPRECATED viewForReactTag:viewRef];
        
        if (view != nil) {
            block(view);
        } else {
            reject(@"takeSnap", [NSString stringWithFormat:@"Unknown find reactTag: %@", viewRef], nil);
        }
    });
}


- (void)takeSnap:(NSNumber*)viewRef command:(NSString *)command writeToDisk:(BOOL)writeToDisk resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
    [self withMapComponentView:viewRef block:^(MBXMapViewComponentView* view) {
        [view takeSnap:writeToDisk resolve:resolve];
    } reject:reject];
}

- (void)clearData:(NSNumber*)viewRef command:(NSString *)command resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self withMapComponentView:viewRef block:^(MBXMapViewComponentView* view) {
        [view clearData:resolve reject:reject];
    } reject:reject];
}


- (void)getCenter:(NSNumber*)viewRef command:(NSString *)command resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self withMapComponentView:viewRef block:^(MBXMapViewComponentView* view) {
        [view getCenter:resolve reject:reject];
    } reject:reject];
}


- (void)getCoordinateFromView:(NSNumber*)viewRef command:(NSString *)command atPoint:(NSArray *)atPoint resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self withMapComponentView:viewRef block:^(MBXMapViewComponentView* view) {
        NSNumber* a = [atPoint objectAtIndex:0];
        NSNumber* b = [atPoint objectAtIndex:1];
        
        [view getCoordinateFromView:CGPointMake(a.floatValue, b.floatValue) resolve:resolve reject:reject];
    } reject:reject];
}


- (void)getPointInView:(NSNumber*)viewRef command:(NSString *)command atCoordinate:(NSArray *)atCoordinate resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self withMapComponentView:viewRef block:^(MBXMapViewComponentView* view) {
        [view getPointInView:atCoordinate resolve:resolve reject:reject];
    } reject:reject];
}


- (void)getVisibleBounds:(NSNumber*)viewRef command:(NSString *)command resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self withMapComponentView:viewRef block:^(MBXMapViewComponentView* view) {
        [view getVisibleBounds:resolve];
    } reject:reject];
}


- (void)getZoom:(NSNumber*)viewRef command:(NSString *)command resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self withMapComponentView:viewRef block:^(MBXMapViewComponentView* view) {
        [view getZoom:resolve reject:reject];
    } reject:reject];
}


- (void)queryRenderedFeaturesAtPoint:(NSNumber*)viewRef command:(NSString *)command atPoint:(NSArray *)atPoint withFilter:(NSArray *)withFilter withLayerIDs:(NSArray *)withLayerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self withMapComponentView:viewRef block:^(MBXMapViewComponentView* view) {
        [view queryRenderedFeaturesAtPoint:atPoint withFilter:withFilter withLayerIDs:withLayerIDs resolve:resolve reject:reject];
    } reject:reject];
}


- (void)queryRenderedFeaturesInRect:(NSNumber*)viewRef command:(NSString *)command withBBox:(NSArray *)withBBox withFilter:(NSArray *)withFilter withLayerIDs:(NSArray *)withLayerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self withMapComponentView:viewRef block:^(MBXMapViewComponentView* view) {
        [view queryRenderedFeaturesInRect:withBBox withFilter:withFilter withLayerIDs:withLayerIDs resolve:resolve reject:reject];
    } reject:reject];
}


- (void)queryTerrainElevation:(NSNumber*)viewRef command:(NSString *)command coordinates:(NSArray *)coordinates resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self withMapComponentView:viewRef block:^(MBXMapViewComponentView* view) {
        [view queryTerrainElevation:coordinates resolve:resolve reject:reject];
    } reject:reject];
}


- (void)setHandledMapChangedEvents:(NSNumber*)viewRef command:(NSString *)command events:(NSArray *)events resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self withMapComponentView:viewRef block:^(MBXMapViewComponentView* view) {
        [view setHandledMapChangedEvents:events resolve:resolve reject:reject];
    } reject:reject];
}


- (void)setSourceVisibility:(NSNumber*)viewRef command:(NSString *)command visible:(BOOL)visible sourceId:(NSString *)sourceId sourceLayerId:(NSString *)sourceLayerId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self withMapComponentView:viewRef block:^(MBXMapViewComponentView* view) {
        [view setSourceVisibility:visible sourceId:sourceId sourceLayerId:sourceLayerId resolve:resolve reject:reject];
    } reject:reject];
}

- (void)querySourceFeatures:sourceId:(NSString* _Nonnull)sourceId withFilter:(NSArray<id>* _Nullable)filter withSourceLayerIDs:(NSArray<NSString*>* _Nullable)sourceLayerIDs resolve:(RCTPromiseResolveBlock _Nonnull )resolve reject:(RCTPromiseRejectBlock _Nonnull )reject {
    [self withMapComponentView:viewRef block:^(MBXMapViewComponentView* view) {
        [view querySourceFeatures:sourceId withFilter:filter withSourceLayerIDs:sourceLayerIDs resolve:resolve reject:reject];
    } reject:reject];
}


// Thanks to this guard, we won't compile this code when we build for the old architecture.
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeMapViewModuleSpecJSI>(params);
}

@end

#endif // RCT_NEW_ARCH_ENABLED
