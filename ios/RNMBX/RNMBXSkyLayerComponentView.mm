#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXSkyLayerComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNMBXSkyLayerComponentView () <RCTRNMBXSkyLayerViewProtocol>
@end

@implementation RNMBXSkyLayerComponentView {
    RNMBXSkyLayer *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXSkyLayerProps>();
    _props = defaultProps;
      [self prepareView];
  }

  return self;
}

- (void)prepareView
{
  _view =  [[RNMBXSkyLayer alloc] init];
  self.contentView = _view;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXSkyLayerComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const RNMBXSkyLayerProps>(props);
  RNMBXSetCommonLayerPropsWithoutSourceID(newProps, _view);
    
  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    [self prepareView];
}

@end

Class<RCTComponentViewProtocol> RNMBXSkyLayerCls(void)
{
  return RNMBXSkyLayerComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
