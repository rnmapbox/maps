#ifdef RCT_NEW_ARCH_ENABLED

#import <UIKit/UIKit.h>

#import <React/RCTUIManager.h>
#import <React/RCTViewComponentView.h>

NS_ASSUME_NONNULL_BEGIN

@interface MBXMapViewComponentView : RCTViewComponentView

- (void)dispatchCameraChangedEvent:(NSDictionary*)event;

- (void)takeSnap:(BOOL)writeToDisk resolve:(RCTPromiseResolveBlock)resolve;
- (void)clearData:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)getCenter:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)getCoordinateFromView:(CGPoint)point resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)getPointInView:(NSArray*)coordinate resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)getVisibleBounds:(RCTPromiseResolveBlock)resolve;
- (void)getZoom:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)queryRenderedFeaturesAtPoint:(NSArray*)point withFilter:(NSArray*)filter withLayerIDs:(NSArray*)layerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)queryRenderedFeaturesInRect:(NSArray*)bbox withFilter:(NSArray*)filter withLayerIDs:(NSArray*)layerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)queryTerrainElevation:(NSArray*)coordinates resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)setHandledMapChangedEvents:(NSArray*)events resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)setSourceVisibility:(BOOL)visible sourceId:(NSString*)sourceId sourceLayerId:(NSString*)sourceLayerId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)querySourceFeatures:sourceId:(NSString*)sourceId withFilter:(NSArray<id>*)filter withSourceLayerIDs:(NSArray<NSString*>*)sourceLayerIDs resolve:(RCTPromiseResolveBlock _Nonnull )resolve reject:(RCTPromiseRejectBlock _Nonnull )reject;

@end

NS_ASSUME_NONNULL_END

#endif // RCT_NEW_ARCH_ENABLED
