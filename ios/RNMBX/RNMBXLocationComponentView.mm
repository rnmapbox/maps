#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXLocationComponentView.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

#import "rnmapbox_maps-Swift.pre.h"

#import "RCTFollyConvert.h"

using namespace facebook::react;


@implementation RNMBXLocationComponentView {
    RNMBXLocation *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXViewportProps>();
    _props = defaultProps;
    _view = [[RNMBXLocation alloc] init];
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
      RNMBXLocationEventEmitter::OnStatusChanged event = {type, payload};
      strongSelf->_eventEmitter->onStatusChanged(event);
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
  const auto &oldViewProps = static_cast<const RNMBXLocationProps &>(*oldProps);
  const auto &newViewProps = static_cast<const RNMBXLocationProps &>(*props);

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
  return RNMBXLocationComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
