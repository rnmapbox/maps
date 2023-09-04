#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXMapViewComponentView.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps/Props.h>
#import <react/renderer/components/rnmapbox_maps/RCTComponentViewHelpers.h>

#import "MBXMapView.h"

using namespace facebook::react;

@interface MBXMapViewComponentView () <RCTMBXMapViewViewProtocol>
@end

@interface MBXMapViewEventDispatcher : NSObject<RCTEventDispatcherProtocol>
@end

@implementation MBXMapViewEventDispatcher {
    MBXMapViewComponentView* _componentView;
}

- (instancetype)initWithComponentView:(MBXMapViewComponentView*)componentView {
    if (self = [super init]) {
        _componentView = componentView;
    }

    return self;
}

- (void)sendEvent:(id<RCTEvent>)event {
    NSDictionary* payload = [event arguments][2];
    [_componentView dispatchCameraChangedEvent:payload];
}

@end

@implementation MBXMapViewComponentView {
  UIView<MBXMapViewProtocol> *_view;
    MBXMapViewEventDispatcher *_eventDispatcher;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXMapViewProps>();
    _props = defaultProps;
    _eventDispatcher = [[MBXMapViewEventDispatcher alloc] initWithComponentView:self];
    _view = [MBXMapViewFactory createWithFrame:frame eventDispatcher:_eventDispatcher];
      
      // capture weak self reference to prevent retain cycle
      __weak __typeof__(self) weakSelf = self;
      
      [_view setOnPress:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;
          
          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              const auto [type, json] = [MBXMapViewComponentView stringifyEventData:event];
              std::dynamic_pointer_cast<const facebook::react::MBXMapViewEventEmitter>(strongSelf->_eventEmitter)->onPress({type, json});
            }
      }];
      
      [_view setOnLongPress:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;
          
          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              const auto [type, json] = [MBXMapViewComponentView stringifyEventData:event];
              std::dynamic_pointer_cast<const facebook::react::MBXMapViewEventEmitter>(strongSelf->_eventEmitter)->onLongPress({type, json});
            }
      }];
      
      [_view setOnMapChange:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;
          
          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              const auto [type, json] = [MBXMapViewComponentView stringifyEventData:event];
              std::dynamic_pointer_cast<const facebook::react::MBXMapViewEventEmitter>(strongSelf->_eventEmitter)->onMapChange({type, json});
            }
      }];

    self.contentView = _view;
  }

  return self;
}

- (void)dispatchCameraChangedEvent:(NSDictionary*)event {
    const auto [type, json] = [MBXMapViewComponentView stringifyEventData:event];
    std::dynamic_pointer_cast<const facebook::react::MBXMapViewEventEmitter>(self->_eventEmitter)->onCameraChanged({type, json});
}

+ (std::tuple<std::string, std::string>)stringifyEventData:(NSDictionary*)event {
    std::string type = [event valueForKey:@"type"] == nil ? "" : std::string([[event valueForKey:@"type"] UTF8String]);
    std::string json = "{}";
    
    NSError *error;
    NSData *jsonData = nil;
    
    if ([event valueForKey:@"payload"] != nil) {
        jsonData = [NSJSONSerialization dataWithJSONObject:[event valueForKey:@"payload"]
                                                           options:0
                                                             error:&error];
    }
    
    if (jsonData) {
        json = std::string([[[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding] UTF8String]);
    }
        
    return {type, json};
}

- (NSDictionary*)convertPositionToDictionary:(const folly::dynamic*)position {
    NSMutableDictionary<NSString*, NSNumber*>* result = [[NSMutableDictionary alloc] init];
    
    if (!position->isNull()) {
        for (auto& pair : position->items()) {
            NSString* key = [NSString stringWithUTF8String:pair.first.getString().c_str()];
            NSNumber* value = [[NSNumber alloc] initWithInt:pair.second.getDouble()];
            [result setValue:value forKey:key];
        }
    }
    
    return result;
}

- (NSDictionary*)convertLocalizeLabels:(const MBXMapViewLocalizeLabelsStruct*)labels {
    NSMutableDictionary* result = [[NSMutableDictionary alloc] init];
    NSMutableArray* ids = [[NSMutableArray alloc] init];
    
    [result setValue:[NSString stringWithUTF8String:labels->locale.c_str()] forKey:@"locale"];
    
    for (auto& layerId : labels->layerIds) {
        NSString* value = [NSString stringWithUTF8String:layerId.c_str()];
        [ids addObject:value];
    }
    
    [result setValue:ids forKey:@"layerIds"];
    
    return result;
}

- (void)takeSnap:(BOOL)writeToDisk resolve:(RCTPromiseResolveBlock)resolve {
    [_view takeSnap:writeToDisk resolve:resolve];
}

- (void)clearData:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [_view clearData:resolve reject:reject];
}

- (void)getCenter:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [_view getCenter:resolve reject:reject];
}

- (void)getCoordinateFromView:(CGPoint)point resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [_view getCoordinateFromView:point resolve:resolve reject:reject];
}

- (void)getPointInView:(NSArray*)coordinate resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [_view getPointInView:coordinate resolve:resolve reject:reject];
}

- (void)getVisibleBounds:(RCTPromiseResolveBlock)resolve {
    [_view getVisibleBounds:resolve];
}

- (void)getZoom:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [_view getZoom:resolve reject:reject];
}

- (void)queryRenderedFeaturesAtPoint:(NSArray*)point withFilter:(NSArray*)filter withLayerIDs:(NSArray*)layerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [_view queryRenderedFeaturesAtPoint:point withFilter:filter withLayerIDs:layerIDs resolve:resolve reject:reject];
}

- (void)queryRenderedFeaturesInRect:(NSArray*)bbox withFilter:(NSArray*)filter withLayerIDs:(NSArray*)layerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [_view queryRenderedFeaturesInRect:bbox withFilter:filter withLayerIDs:layerIDs resolve:resolve reject:reject];
}

- (void)queryTerrainElevation:(NSArray*)coordinates resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [_view queryTerrainElevation:coordinates resolve:resolve reject:reject];
}

- (void)setHandledMapChangedEvents:(NSArray*)events resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [_view setHandledMapChangedEvents:events resolve:resolve reject:reject];
}

- (void)setSourceVisibility:(BOOL)visible sourceId:(NSString*)sourceId sourceLayerId:(NSString*)sourceLayerId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [_view setSourceVisibility:visible sourceId:sourceId sourceLayerId:sourceLayerId resolve:resolve reject:reject];
}

- (void)querySourceFeatures:(NSString*)sourceId withFilter:(NSArray<id>*)filter withSourceLayerIDs:(NSArray<NSString*>*)sourceLayerIDs resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [_view querySourceFeatures:sourceId withFilter:filter withSourceLayerIDs:sourceLayerIDs resolve:resolve reject:reject];
}


#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MBXMapViewComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXMapViewProps>(props);
    [_view setAttributionEnabled:newProps.attributionEnabled];
    [_view setAttributionPosition:[self convertPositionToDictionary:&newProps.attributionPosition]];
    
    [_view setLogoEnabled:newProps.logoEnabled];
    [_view setLogoPosition:[self convertPositionToDictionary:&newProps.logoPosition]];
    
    [_view setCompassEnabled:newProps.compassEnabled];
    [_view setCompassFadeWhenNorth:newProps.compassFadeWhenNorth];
    [_view setCompassPosition:[self convertPositionToDictionary:&newProps.compassPosition]];
    [_view setCompassViewPosition:newProps.compassViewPosition];
    [_view setCompassViewMargins:CGPointMake(newProps.compassViewMargins.x, newProps.compassViewMargins.y)];
    [_view setCompassImage:[NSString stringWithUTF8String:newProps.compassImage.c_str()]];
    
    [_view setScaleBarEnabled:newProps.scaleBarEnabled];
    [_view setScaleBarPosition:[self convertPositionToDictionary:&newProps.scaleBarPosition]];
    
    [_view setZoomEnabled:newProps.zoomEnabled];
    [_view setScrollEnabled:newProps.scrollEnabled];
    [_view setRotateEnabled:newProps.rotateEnabled];
    [_view setPitchEnabled:newProps.pitchEnabled];
    
    [_view setProjection:newProps.projection == MBXMapViewProjection::Mercator ? @"mercator" : @"globe"];
    [_view setStyleUrl:[NSString stringWithUTF8String:newProps.styleURL.c_str()]];
    
    if (!newProps.localizeLabels.locale.empty()) {
        [_view setLocalizeLabels:[self convertLocalizeLabels:&newProps.localizeLabels]];
    }
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXMapViewCls(void)
{
  return MBXMapViewComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
