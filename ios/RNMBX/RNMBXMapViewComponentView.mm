#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXMapViewComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

#import "RNMBXFabricPropConvert.h"

using namespace facebook::react;

@interface RNMBXMapViewComponentView () <RCTRNMBXMapViewViewProtocol>
@end

@interface RNMBXMapViewEventDispatcher : NSObject<RCTEventDispatcherProtocol>
@end

@implementation RNMBXMapViewEventDispatcher {
    RNMBXMapViewComponentView* _componentView;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
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
    CGRect _frame;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXMapViewProps>();
    _props = defaultProps;
    _frame = frame;
    [self prepareView];
  }
  return self;
}

- (void)prepareView
{
    _eventDispatcher = [[RNMBXMapViewEventDispatcher alloc] initWithComponentView:self];
      _view =  [[RNMBXMapView alloc] initWithFrame:_frame eventDispatcher:_eventDispatcher];
      
      // just need to pass something, it won't really be used on fabric, but it's used to create events (it won't impact sending them)
      _view.reactTag = @-1;
      
      // capture weak self reference to prevent retain cycle
      __weak __typeof__(self) weakSelf = self;
      
      [_view setReactOnPress:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;

          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              const auto [type, json] = RNMBXStringifyEventData(event);
              std::dynamic_pointer_cast<const facebook::react::RNMBXMapViewEventEmitter>(strongSelf->_eventEmitter)->onPress({type, json});
            }
      }];

      [_view setReactOnLongPress:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;

          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              const auto [type, json] = RNMBXStringifyEventData(event);
              std::dynamic_pointer_cast<const facebook::react::RNMBXMapViewEventEmitter>(strongSelf->_eventEmitter)->onLongPress({type, json});
            }
      }];

      [_view setReactOnMapChange:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;

          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              const auto [type, json] = RNMBXStringifyEventData(event);
              std::dynamic_pointer_cast<const facebook::react::RNMBXMapViewEventEmitter>(strongSelf->_eventEmitter)->onMapChange({type, json});
            }
      }];
    self.contentView = _view;
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    if ([childComponentView isKindOfClass:[RCTViewComponentView class]] && ((RCTViewComponentView *)childComponentView).contentView) {
        [_view addToMap:((RCTViewComponentView *)childComponentView).contentView];
    }
    [super mountChildComponentView:childComponentView index:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    if ([childComponentView isKindOfClass:[RCTViewComponentView class]] && ((RCTViewComponentView *)childComponentView).contentView) {
        [_view removeFromMap:((RCTViewComponentView *)childComponentView).contentView];
    }
    [super unmountChildComponentView:childComponentView index:index];
}

- (void)dispatchCameraChangedEvent:(NSDictionary*)event {
    const auto [type, json] = RNMBXStringifyEventData(event);
    std::dynamic_pointer_cast<const facebook::react::RNMBXMapViewEventEmitter>(self->_eventEmitter)->onCameraChanged({type, json});
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXMapViewComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
    const auto &oldViewProps = static_cast<const RNMBXMapViewProps &>(*oldProps);
    const auto &newViewProps = static_cast<const RNMBXMapViewProps &>(*props);
  
    id attributionEnabled = RNMBXConvertFollyDynamicToId(newViewProps.attributionEnabled);
    if (attributionEnabled != nil) {
        _view.reactAttributionEnabled = attributionEnabled;
    }

    id attributionPosition = RNMBXConvertFollyDynamicToId(newViewProps.attributionPosition);
    if (attributionPosition != nil) {
        _view.reactAttributionPosition = attributionPosition;
    }

    id logoEnabled = RNMBXConvertFollyDynamicToId(newViewProps.logoEnabled);
    if (logoEnabled != nil) {
        _view.reactLogoEnabled = logoEnabled;
    }

    id logoPosition = RNMBXConvertFollyDynamicToId(newViewProps.logoPosition);
    if (logoPosition != nil) {
        _view.reactLogoPosition = logoPosition;
    }

    id compassEnabled = RNMBXConvertFollyDynamicToId(newViewProps.compassEnabled);
    if (compassEnabled != nil) {
        _view.reactCompassEnabled = compassEnabled;
    }

    id compassFadeWhenNorth = RNMBXConvertFollyDynamicToId(newViewProps.compassFadeWhenNorth);
    if (compassFadeWhenNorth != nil) {
        _view.reactCompassFadeWhenNorth = compassFadeWhenNorth;
    }

    id compassPosition = RNMBXConvertFollyDynamicToId(newViewProps.compassPosition);
    if (compassPosition != nil) {
        _view.reactCompassPosition = compassPosition;
    }

    id compassViewPosition = RNMBXConvertFollyDynamicToId(newViewProps.compassViewPosition);
    if (compassViewPosition != nil) {
        _view.reactCompassViewPosition = [(NSNumber *)compassViewPosition doubleValue];
    }

    NSDictionary<NSString *, NSNumber *> *compassViewMargins = RNMBXConvertFollyDynamicToId(newViewProps.compassViewMargins);
    if (compassViewMargins != nil) {
        CGPoint margins = CGPointMake([compassViewMargins[@"x"] doubleValue], [compassViewMargins[@"y"] doubleValue]);
        _view.reactCompassViewMargins = margins;
    }

    id compassImage = RNMBXConvertFollyDynamicToId(newViewProps.compassImage);
    if (compassImage != nil) {
        _view.reactCompassImage = compassImage;
    }

    RNMBX_REMAP_OPTIONAL_PROP_BOOL(scaleBarEnabled, reactScaleBarEnabled)

    id scaleBarPosition = RNMBXConvertFollyDynamicToId(newViewProps.scaleBarPosition);
    if (scaleBarPosition != nil) {
        _view.reactScaleBarPosition = scaleBarPosition;
    }

    id zoomEnabled = RNMBXConvertFollyDynamicToId(newViewProps.zoomEnabled);
    if (zoomEnabled != nil) {
        _view.reactZoomEnabled = zoomEnabled;
    }

    id scrollEnabled = RNMBXConvertFollyDynamicToId(newViewProps.scrollEnabled);
    if (scrollEnabled != nil) {
        _view.reactScrollEnabled = scrollEnabled;
    }

    id rotateEnabled = RNMBXConvertFollyDynamicToId(newViewProps.rotateEnabled);
    if (rotateEnabled != nil) {
        _view.reactRotateEnabled = rotateEnabled;
    }

    id pitchEnabled = RNMBXConvertFollyDynamicToId(newViewProps.pitchEnabled);
    if (pitchEnabled != nil) {
        _view.reactPitchEnabled = pitchEnabled;
    }

    id projection = RNMBXConvertFollyDynamicToId(newViewProps.projection);
    if (projection != nil) {
        _view.reactProjection = projection;
    }

    id localizeLabels = RNMBXConvertFollyDynamicToId(newViewProps.localizeLabels);
    if (localizeLabels != nil) {
        _view.reactLocalizeLabels = localizeLabels;
    }
  
    RNMBX_OPTIONAL_PROP_BOOL(deselectAnnotationOnTap);

    id styleURL = RNMBXConvertFollyDynamicToId(newViewProps.styleURL);
    if (styleURL != nil) {
        _view.reactStyleURL = styleURL;
    }

  [super updateProps:props oldProps:oldProps];

  [_view didSetProps:@[]];
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    [self prepareView];
}

@end

Class<RCTComponentViewProtocol> RNMBXMapViewCls(void)
{
  return RNMBXMapViewComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
