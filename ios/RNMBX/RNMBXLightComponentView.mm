#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXLightComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTBridge+Private.h>
#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNMBXLightComponentView () <RCTRNMBXLightViewProtocol>
@end

@implementation RNMBXLightComponentView {
    RNMBXLight *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXLightProps>();
    _props = defaultProps;
      [self prepareView];
    }

    return self;
  }

- (void)prepareView
{
  _view = [[RNMBXLight alloc] init];
  _view.bridge = [RCTBridge currentBridge];
  self.contentView = _view;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXLightComponentDescriptor>();
}


- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = static_cast<const RNMBXLightProps &>(*props);
    id reactStyle = RNMBXConvertFollyDynamicToId(newProps.reactStyle);
    if (reactStyle != nil) {
        _view.reactStyle = reactStyle;
    }
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> RNMBXLightCls(void)
{
  return RNMBXLightComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
