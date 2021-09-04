#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RCTMGLRasterDemSourceManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(id, NSString)
RCT_EXPORT_VIEW_PROPERTY(url, NSString)
RCT_EXPORT_VIEW_PROPERTY(tileUrlTemplates, NSArray)
RCT_EXPORT_VIEW_PROPERTY(bounds, NSArray)
RCT_EXPORT_VIEW_PROPERTY(minZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(maxZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(tileSize, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(attribution, NSString)
RCT_EXPORT_VIEW_PROPERTY(encoding, NSString)
RCT_EXPORT_VIEW_PROPERTY(volatile, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(prefetchZoomDelta, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(minimumTileUpdateInterval, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(maxOverscaleFactorForParentTiles, NSNumber)

@end
