#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXHeatmapLayerComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNMBXHeatmapLayerComponentView () <RCTRNMBXHeatmapLayerViewProtocol>
@end

@implementation RNMBXHeatmapLayerComponentView {
    RNMBXHeatmapLayer *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXHeatmapLayerProps>();
    _props = defaultProps;
      [self prepareView];
  }

  return self;
}

- (void)prepareView
{
  _view =  [[RNMBXHeatmapLayer alloc] init];
  self.contentView = _view;
}
#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXHeatmapLayerComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const RNMBXHeatmapLayerProps>(props);
  RNMBXSetCommonLayerProps(newProps, _view);


  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    [self prepareView];
}

@end

Class<RCTComponentViewProtocol> RNMBXHeatmapLayerCls(void)
{
  return RNMBXHeatmapLayerComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
