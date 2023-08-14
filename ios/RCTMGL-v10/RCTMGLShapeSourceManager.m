#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface
RCT_EXTERN_REMAP_MODULE(RCTMGLShapeSource, RCTMGLShapeSourceManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(id, NSString)
RCT_EXPORT_VIEW_PROPERTY(existing, BOOL)
RCT_EXPORT_VIEW_PROPERTY(url, NSString)
RCT_EXPORT_VIEW_PROPERTY(shape, NSString)
RCT_EXPORT_VIEW_PROPERTY(lineStartOffset, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(lineEndOffset, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(animationDuration, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(snapIfDistanceIsGreaterThan, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(cluster, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(clusterRadius, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(clusterMaxZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(clusterProperties, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(maxZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(buffer, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(tolerance, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(lineMetrics, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(images, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(nativeImages, NSArray)
RCT_EXPORT_VIEW_PROPERTY(hasPressListener, BOOL)
RCT_EXPORT_VIEW_PROPERTY(hitbox, NSDictionary)
RCT_REMAP_VIEW_PROPERTY(onMapboxShapeSourcePress, onPress, RCTBubblingEventBlock)

RCT_EXTERN_METHOD(getClusterExpansionZoom:(nonnull NSNumber*)reactTag
                                featureJSON:(nonnull NSString*)featureJSON
                                resolver:(RCTPromiseResolveBlock)resolve
                                rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getClusterLeaves:(nonnull NSNumber*)reactTag
                  featureJSON:(nonnull NSString*)featureJSON
                  number:(NSUInteger) number
                  offset:(NSUInteger) offset
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getClusterChildren:(nonnull NSNumber*)reactTag
                  featureJSON:(nonnull NSString*)featureJSON
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
