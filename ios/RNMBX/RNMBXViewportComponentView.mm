#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXViewportComponentView.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

#import "rnmapbox_maps-Swift.pre.h"

#import "RCTFollyConvert.h"


// TODO: use generated RNMBXViewportEventEmitter, but need 0.73+ for dynamic support
class RNMBXViewportEventEmitter : public facebook::react::ViewEventEmitter {
 public:
  using facebook::react::ViewEventEmitter::ViewEventEmitter;

  struct OnStatusChanged {
    std::string type;
    folly::dynamic payload;
  };
  void onStatusChanged(OnStatusChanged $event) const {
    dispatchEvent("statusChanged", [$event=std::move($event)](facebook::jsi::Runtime &runtime) {
      auto $payload = facebook::jsi::Object(runtime);
      $payload.setProperty(runtime, "type", $event.type);
      $payload.setProperty(runtime, "payload", facebook::jsi::valueFromDynamic(runtime, $event.payload));
      return $payload;
    });
  }
};

using namespace facebook::react;

NSNumber* convertDynamicToOptional_boolean(const folly::dynamic &dyn, NSString* propertyName) {
  switch (dyn.type()) {
    case folly::dynamic::NULLT:
      return NULL;
    case folly::dynamic::BOOL:
      return [NSNumber numberWithBool:dyn.getBool()];
    default:
      std::stringstream ss;
      ss << dyn;
      [RNMBXLogger error:[NSString stringWithFormat:@"Property %@ expected to be a boolean or nil but was: $d",
                          propertyName,
                          ss.str().c_str()
                         ]];
      return NULL;
  }
}

@implementation RNMBXViewportComponentView {
    RNMBXViewport *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXViewportProps>();
    _props = defaultProps;
    _view = [[RNMBXViewport alloc] init];
    [self prepareView];
    
    self.contentView = _view;
  }
  
  return self;
}

- (void)prepareView
{
  __weak __typeof__(self) weakSelf = self;

  [_view setOnStatusChanged:^(NSDictionary* event) {
    __typeof__(self) strongSelf = weakSelf;
    
    if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
      auto type = std::string([[event objectForKey:@"type"] UTF8String]);
      auto payload = convertIdToFollyDynamic([event objectForKey:@"payload"]);
      ::RNMBXViewportEventEmitter::OnStatusChanged event = {type, payload};
      std::reinterpret_pointer_cast<const ::RNMBXViewportEventEmitter>(strongSelf->_eventEmitter)->onStatusChanged(event);
    }
  }];
}


#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXViewportComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldViewProps = static_cast<const RNMBXViewportProps &>(*oldProps);
  const auto &newViewProps = static_cast<const RNMBXViewportProps &>(*props);

  if (!oldProps.get() || oldViewProps.transitionsToIdleUponUserInteraction != newViewProps.transitionsToIdleUponUserInteraction) {
    _view.transitionsToIdleUponUserInteraction = convertDynamicToOptional_boolean(newViewProps.transitionsToIdleUponUserInteraction, @"transitionsToIdleUponUserInteraction");
  }
  if (!oldProps.get() ||
      oldViewProps.hasStatusChanged !=
      newViewProps.hasStatusChanged) {
    _view.hasStatusChanged = newViewProps.hasStatusChanged;
  }
  [super updateProps:props oldProps:oldProps];
}
@end

Class<RCTComponentViewProtocol> RNMBXViewportCls(void)
{
  return RNMBXViewportComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
