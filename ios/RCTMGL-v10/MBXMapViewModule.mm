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


- (void)takeSnap:(NSNumber*)viewRef writeToDisk:(BOOL)writeToDisk resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
    [self withMapComponentView:viewRef block:^(MBXMapViewComponentView* view){
        [view takeSnap:writeToDisk resolve:resolve];
    } reject:reject];
}

- (void)clearData:(double)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    reject(@"clearData", @"not implemented yet", nil);
}


- (void)getCenter:(double)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    reject(@"getCenter", @"not implemented yet", nil);
}


- (void)getCoordinateFromView:(double)viewRef atPoint:(NSArray *)atPoint resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    reject(@"getCoordinateFromView", @"not implemented yet", nil);
}


- (void)getPointInView:(double)viewRef atCoordinate:(NSArray *)atCoordinate resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    reject(@"getPointInView", @"not implemented yet", nil);
}


- (void)getVisibleBounds:(double)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    reject(@"getVisibleBounds", @"not implemented yet", nil);
}


- (void)getZoom:(double)viewRef resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    reject(@"getZoom", @"not implemented yet", nil);
}


- (void)queryRenderedFeaturesAtPoint:(double)viewRef atPoint:(NSArray *)atPoint withFilter:(NSArray *)withFilter withLayerIDs:(NSArray *)withLayerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    reject(@"queryRenderedFeaturesAtPoint", @"not implemented yet", nil);
}


- (void)queryRenderedFeaturesInRect:(double)viewRef withBBox:(NSArray *)withBBox withFilter:(NSArray *)withFilter withLayerIDs:(NSArray *)withLayerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    reject(@"queryRenderedFeaturesInRect", @"not implemented yet", nil);
}


- (void)queryTerrainElevation:(double)viewRef coordinates:(NSArray *)coordinates resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    reject(@"queryTerrainElevation", @"not implemented yet", nil);
}


- (void)setHandledMapChangedEvents:(double)viewRef events:(NSArray *)events resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    reject(@"setHandledMapChangedEvents", @"not implemented yet", nil);
}


- (void)setSourceVisibility:(double)viewRef visible:(BOOL)visible sourceId:(NSString *)sourceId sourceLayerId:(NSString *)sourceLayerId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    reject(@"setSourceVisibility", @"not implemented yet", nil);
}


// Thanks to this guard, we won't compile this code when we build for the old architecture.
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeMapViewModuleSpecJSI>(params);
}

@end

#endif // RCT_NEW_ARCH_ENABLED
