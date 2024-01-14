#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RNMBXMapView, RNMBXMapViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(onCameraChanged, RCTDirectEventBlock)

RCT_REMAP_VIEW_PROPERTY(attributionEnabled, reactAttributionEnabled, BOOL)
RCT_REMAP_VIEW_PROPERTY(attributionPosition, reactAttributionPosition, NSDictionary)

RCT_REMAP_VIEW_PROPERTY(logoEnabled, reactLogoEnabled, BOOL)
RCT_REMAP_VIEW_PROPERTY(logoPosition, reactLogoPosition, NSDictionary)

RCT_REMAP_VIEW_PROPERTY(compassEnabled, reactCompassEnabled, BOOL)
RCT_REMAP_VIEW_PROPERTY(compassFadeWhenNorth, reactCompassFadeWhenNorth, BOOL)
RCT_REMAP_VIEW_PROPERTY(compassPosition, reactCompassPosition, NSDictionary)
RCT_REMAP_VIEW_PROPERTY(compassViewPosition, reactCompassViewPosition, NSInteger)
RCT_REMAP_VIEW_PROPERTY(compassViewMargins, reactCompassViewMargins, CGPoint)
RCT_REMAP_VIEW_PROPERTY(compassImage, reactCompassImage, NSString)

RCT_REMAP_VIEW_PROPERTY(scaleBarEnabled, reactScaleBarEnabled, BOOL)
RCT_REMAP_VIEW_PROPERTY(scaleBarPosition, reactScaleBarPosition, NSDictionary)

RCT_REMAP_VIEW_PROPERTY(zoomEnabled, reactZoomEnabled, BOOL)
RCT_REMAP_VIEW_PROPERTY(scrollEnabled, reactScrollEnabled, BOOL)
RCT_REMAP_VIEW_PROPERTY(rotateEnabled, reactRotateEnabled, BOOL)
RCT_REMAP_VIEW_PROPERTY(pitchEnabled, reactPitchEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(deselectAnnotationOnTap, BOOL)

RCT_REMAP_VIEW_PROPERTY(projection, reactProjection, NSString)
RCT_REMAP_VIEW_PROPERTY(localizeLabels, reactLocalizeLabels, NSDictionary)

RCT_REMAP_VIEW_PROPERTY(gestureSettings, reactGestureSettings, NSDictionary)

RCT_REMAP_VIEW_PROPERTY(styleURL, reactStyleURL, NSString)
RCT_REMAP_VIEW_PROPERTY(onPress, reactOnPress, RCTBubblingEventBlock)
RCT_REMAP_VIEW_PROPERTY(onLongPress, reactOnLongPress, RCTBubblingEventBlock)
RCT_REMAP_VIEW_PROPERTY(onMapChange, reactOnMapChange, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(mapViewImpl, NSString)

@end
