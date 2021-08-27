#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RCTMGLCircleLayerManager, RCTViewManager)

// circle layer props
RCT_EXPORT_VIEW_PROPERTY(sourceLayerID, NSString)

// standard layer props
RCT_EXPORT_VIEW_PROPERTY(id, NSString);
RCT_EXPORT_VIEW_PROPERTY(sourceID, NSString);
RCT_EXPORT_VIEW_PROPERTY(filter, NSArray);

RCT_REMAP_VIEW_PROPERTY(aboveLayerID, reactAboveLayerID, NSString);
RCT_REMAP_VIEW_PROPERTY(belowLayerID, reactBelowLayerID, NSString);
RCT_REMAP_VIEW_PROPERTY(layerIndex, reactLayerIndex, NSNumber);
RCT_EXPORT_VIEW_PROPERTY(reactStyle, NSDictionary);

RCT_REMAP_VIEW_PROPERTY(maxZoomLevel, reactMaxZoomLevel, NSNumber);
RCT_REMAP_VIEW_PROPERTY(minZoomLevel, reactMinZoomLevel, NSNumber);

@end
