#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXMapViewComponentView.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

#import "rnmapbox_maps-Swift.h.pre"

using namespace facebook::react;

@interface RNMBXMapViewComponentView () <RCTRNMBXMapViewViewProtocol>
@end

@interface RNMBXMapViewEventDispatcher : NSObject<RCTEventDispatcherProtocol>
@end

@implementation RNMBXMapViewEventDispatcher {
    RNMBXMapViewComponentView* _componentView;
}

- (instancetype)initWithComponentView:(RNMBXMapViewComponentView*)componentView {
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

@implementation RNMBXMapViewComponentView {
    RNMBXMapView *_view;
    RNMBXMapViewEventDispatcher *_eventDispatcher;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXMapViewProps>();
    _props = defaultProps;
    _eventDispatcher = [[RNMBXMapViewEventDispatcher alloc] initWithComponentView:self];
      _view =  [[RNMBXMapView alloc] initWithFrame:frame eventDispatcher:_eventDispatcher];
      
      // just need to pass something, it won't really be used on fabric, but it's used to create events (it won't impact sending them)
      _view.reactTag = @-1;
      
      // capture weak self reference to prevent retain cycle
      __weak __typeof__(self) weakSelf = self;
      
      [_view setReactOnPress:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;

          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              const auto [type, json] = [RNMBXMapViewComponentView stringifyEventData:event];
              std::dynamic_pointer_cast<const facebook::react::RNMBXMapViewEventEmitter>(strongSelf->_eventEmitter)->onPress({type, json});
            }
      }];

      [_view setReactOnLongPress:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;

          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              const auto [type, json] = [RNMBXMapViewComponentView stringifyEventData:event];
              std::dynamic_pointer_cast<const facebook::react::RNMBXMapViewEventEmitter>(strongSelf->_eventEmitter)->onLongPress({type, json});
            }
      }];

      [_view setReactOnMapChange:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;

          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              const auto [type, json] = [RNMBXMapViewComponentView stringifyEventData:event];
              std::dynamic_pointer_cast<const facebook::react::RNMBXMapViewEventEmitter>(strongSelf->_eventEmitter)->onMapChange({type, json});
            }
      }];

    self.contentView = _view;
  }

  return self;
}

- (void)dispatchCameraChangedEvent:(NSDictionary*)event {
    const auto [type, json] = [RNMBXMapViewComponentView stringifyEventData:event];
    std::dynamic_pointer_cast<const facebook::react::RNMBXMapViewEventEmitter>(self->_eventEmitter)->onCameraChanged({type, json});
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

- (NSDictionary*)convertLocalizeLabels:(const RNMBXMapViewLocalizeLabelsStruct*)labels {
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


#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXMapViewComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const RNMBXMapViewProps>(props);
    [_view setReactAttributionEnabled:newProps.attributionEnabled];
    [_view setReactAttributionPosition:[self convertPositionToDictionary:&newProps.attributionPosition]];

    [_view setReactLogoEnabled:newProps.logoEnabled];
    [_view setReactLogoPosition:[self convertPositionToDictionary:&newProps.logoPosition]];

    [_view setReactCompassEnabled:newProps.compassEnabled];
    [_view setReactCompassFadeWhenNorth:newProps.compassFadeWhenNorth];
    [_view setReactCompassPosition:[self convertPositionToDictionary:&newProps.compassPosition]];
    [_view setReactCompassViewPosition:newProps.compassViewPosition];
    [_view setReactCompassViewMargins:CGPointMake(newProps.compassViewMargins.x, newProps.compassViewMargins.y)];
    [_view setReactCompassImage:[NSString stringWithUTF8String:newProps.compassImage.c_str()]];

    [_view setReactScaleBarEnabled:newProps.scaleBarEnabled];
    [_view setReactScaleBarPosition:[self convertPositionToDictionary:&newProps.scaleBarPosition]];

    [_view setReactZoomEnabled:newProps.zoomEnabled];
    [_view setReactScrollEnabled:newProps.scrollEnabled];
    [_view setReactRotateEnabled:newProps.rotateEnabled];
    [_view setReactPitchEnabled:newProps.pitchEnabled];

    [_view setReactProjection:newProps.projection == RNMBXMapViewProjection::Mercator ? @"mercator" : @"globe"];
    [_view setReactStyleURL:[NSString stringWithUTF8String:newProps.styleURL.c_str()]];

    if (!newProps.localizeLabels.locale.empty()) {
        [_view setReactLocalizeLabels:[self convertLocalizeLabels:&newProps.localizeLabels]];
    }
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> RNMBXMapViewCls(void)
{
  return RNMBXMapViewComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
