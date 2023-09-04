#import <React/RCTUIManager.h>

@protocol MBXMapViewProtocol
- (void)setAttributionEnabled:(BOOL)enabled;
- (void)setAttributionPosition:(NSDictionary<NSString*, NSNumber*>*)position;
- (void)setLogoEnabled:(BOOL)enabled;
- (void)setLogoPosition:(NSDictionary<NSString*, NSNumber*>*)position;

- (void)setCompassEnabled:(BOOL)enabled;
- (void)setCompassFadeWhenNorth:(BOOL)enabled;
- (void)setCompassPosition:(NSDictionary<NSString*, NSNumber*>*)position;
- (void)setCompassViewPosition:(NSInteger)position;
- (void)setCompassViewMargins:(CGPoint)position;
- (void)setCompassImage:(NSString*)position;

- (void)setScaleBarEnabled:(BOOL)enabled;
- (void)setScaleBarPosition:(NSDictionary<NSString*, NSNumber*>*)position;

- (void)setZoomEnabled:(BOOL)enabled;
- (void)setScrollEnabled:(BOOL)enabled;
- (void)setRotateEnabled:(BOOL)enabled;
- (void)setPitchEnabled:(BOOL)enabled;

- (void)setProjection:(NSString*)projection;
- (void)setLocalizeLabels:(NSDictionary*)labels;
- (void)setStyleUrl:(NSString*)url;

- (void)setOnPress:(RCTBubblingEventBlock)callback;
- (void)setOnLongPress:(RCTBubblingEventBlock)callback;
- (void)setOnMapChange:(RCTBubblingEventBlock)callback;

- (void)takeSnap:(BOOL)writeToDisk resolve:(RCTPromiseResolveBlock)resolve;
- (void)clearData:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)getCenter:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)getCoordinateFromView:(CGPoint)point resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)getPointInView:(NSArray<NSNumber*>*)point resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)getVisibleBounds:(RCTPromiseResolveBlock)resolve;
- (void)getZoom:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)queryRenderedFeaturesAtPoint:(NSArray<NSNumber*>*)point withFilter:(NSArray<id>* _Nullable)filter withLayerIDs:(NSArray<NSString*>* _Nullable)layerIDs resolve:(RCTPromiseResolveBlock _Nonnull )resolve reject:(RCTPromiseRejectBlock _Nonnull )reject;
- (void)queryRenderedFeaturesInRect:(NSArray<NSNumber*>* _Nonnull)bbox withFilter:(NSArray<id>* _Nullable)filter withLayerIDs:(NSArray<NSString*>* _Nullable)layerIDs resolve:(RCTPromiseResolveBlock _Nonnull )resolve reject:(RCTPromiseRejectBlock _Nonnull )reject;
- (void)queryTerrainElevation:(NSArray<NSNumber*>* _Nonnull)coordinates resolve:(RCTPromiseResolveBlock _Nonnull )resolve reject:(RCTPromiseRejectBlock _Nonnull )reject;
- (void)setHandledMapChangedEvents:(NSArray<NSString*>* _Nonnull)events resolve:(RCTPromiseResolveBlock _Nonnull )resolve reject:(RCTPromiseRejectBlock _Nonnull )reject;
- (void)setSourceVisibility:(BOOL)visible sourceId:(NSString* _Nonnull)sourceId sourceLayerId:(NSString* _Nullable)sourceLayerId resolve:(RCTPromiseResolveBlock _Nonnull )resolve reject:(RCTPromiseRejectBlock _Nonnull )reject;
- (void)querySourceFeatures:(NSString* _Nonnull)sourceId withFilter:(NSArray<id>* _Nullable)filter withSourceLayerIDs:(NSArray<NSString*>* _Nullable)sourceLayerIDs resolve:(RCTPromiseResolveBlock _Nonnull )resolve reject:(RCTPromiseRejectBlock _Nonnull )reject;

@end

@interface MBXMapViewFactory
+ (UIView<MBXMapViewProtocol>*)createWithFrame:(CGRect)frame eventDispatcher:(id<RCTEventDispatcherProtocol>)eventDispatcher NS_SWIFT_NAME(create(frame:eventDispatcher:));
@end
