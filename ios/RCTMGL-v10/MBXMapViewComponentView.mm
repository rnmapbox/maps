#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXMapViewComponentView.h"
#import "MBXMapFeatureView.h"
#import "MBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>
// needed for compilation for some reason
#import <CoreFoundation/CoreFoundation.h>
#import <CoreLocation/CoreLocation.h>

@interface MapView : UIView
@end

#import <rnmapbox_maps-Swift.h>

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
    MBXMapView *_view;
    MBXMapViewEventDispatcher *_eventDispatcher;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXMapViewProps>();
    _props = defaultProps;
    _eventDispatcher = [[MBXMapViewEventDispatcher alloc] initWithComponentView:self];
      _view =  [[MBXMapView alloc] initWithFrame:frame eventDispatcher:_eventDispatcher];
      
      // just need to pass something, it won't really be used on fabric, but it's used to create events (it won't impact sending them)
      _view.reactTag = @-1;
      
      // capture weak self reference to prevent retain cycle
      __weak __typeof__(self) weakSelf = self;
      
      [_view setReactOnPress:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;

          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              const auto [type, json] = RNMBXStringifyEventData(event);
              std::dynamic_pointer_cast<const facebook::react::MBXMapViewEventEmitter>(strongSelf->_eventEmitter)->onPress({type, json});
            }
      }];

      [_view setReactOnLongPress:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;

          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              const auto [type, json] = RNMBXStringifyEventData(event);
              std::dynamic_pointer_cast<const facebook::react::MBXMapViewEventEmitter>(strongSelf->_eventEmitter)->onLongPress({type, json});
            }
      }];

      [_view setReactOnMapChange:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;

          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              const auto [type, json] = RNMBXStringifyEventData(event);
              std::dynamic_pointer_cast<const facebook::react::MBXMapViewEventEmitter>(strongSelf->_eventEmitter)->onMapChange({type, json});
            }
      }];

    self.contentView = _view;
  }

  return self;
}

- (void)dispatchCameraChangedEvent:(NSDictionary*)event {
    const auto [type, json] = RNMBXStringifyEventData(event);
    std::dynamic_pointer_cast<const facebook::react::MBXMapViewEventEmitter>(self->_eventEmitter)->onCameraChanged({type, json});
}

- (void)insertSubview:(UIView *)view atIndex:(NSInteger)index
{
    if ([view conformsToProtocol:@protocol(MBXMapFeatureView)]) {
        id<MBXMapFeatureView> featureView = (id<MBXMapFeatureView>)view;
        [_view addToMap:featureView.mapFeature];
    }
    
    [super insertSubview:view atIndex:index];
}

- (void)willRemoveSubview:(UIView *)subview
{
    if ([subview conformsToProtocol:@protocol(MBXMapFeatureView)]) {
        id<MBXMapFeatureView> featureView = (id<MBXMapFeatureView>)subview;
        [_view removeFromMap:featureView.mapFeature];
    }
    
    [super willRemoveSubview:subview];
}


#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MBXMapViewComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXMapViewProps>(props);
    [_view setReactAttributionEnabled:newProps.attributionEnabled];
    [_view setReactAttributionPosition:RNMBXConvertDynamicToDictionary(&newProps.attributionPosition)];

    [_view setReactLogoEnabled:newProps.logoEnabled];
    [_view setReactLogoPosition:RNMBXConvertDynamicToDictionary(&newProps.logoPosition)];

    [_view setReactCompassEnabled:newProps.compassEnabled];
    [_view setReactCompassFadeWhenNorth:newProps.compassFadeWhenNorth];
    [_view setReactCompassPosition:RNMBXConvertDynamicToDictionary(&newProps.compassPosition)];
    [_view setReactCompassViewPosition:newProps.compassViewPosition];
    [_view setReactCompassViewMargins:CGPointMake(newProps.compassViewMargins.x, newProps.compassViewMargins.y)];
    [_view setReactCompassImage:[NSString stringWithUTF8String:newProps.compassImage.c_str()]];

    [_view setReactScaleBarEnabled:newProps.scaleBarEnabled];
    [_view setReactScaleBarPosition:RNMBXConvertDynamicToDictionary(&newProps.scaleBarPosition)];

    [_view setReactZoomEnabled:newProps.zoomEnabled];
    [_view setReactScrollEnabled:newProps.scrollEnabled];
    [_view setReactRotateEnabled:newProps.rotateEnabled];
    [_view setReactPitchEnabled:newProps.pitchEnabled];

    [_view setReactProjection:newProps.projection == MBXMapViewProjection::Mercator ? @"mercator" : @"globe"];
    [_view setReactStyleURL:[NSString stringWithUTF8String:newProps.styleURL.c_str()]];

    if (!newProps.localizeLabels.locale.empty()) {
        [_view setReactLocalizeLabels:RNMBXConvertLocalizeLabels(&newProps.localizeLabels)];
    }
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXMapViewCls(void)
{
  return MBXMapViewComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
