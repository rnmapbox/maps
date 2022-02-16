#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RCTMGLRasterSourceManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(id, NSString)
RCT_EXPORT_VIEW_PROPERTY(url, NSString)
RCT_EXPORT_VIEW_PROPERTY(tileUrlTemplates, NSArray)

RCT_EXPORT_VIEW_PROPERTY(tileSize, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(minZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(maxZoomLevel, NSNumber)

RCT_EXPORT_VIEW_PROPERTY(tms, BOOL)
RCT_EXPORT_VIEW_PROPERTY(attribution, NSString)


@end
