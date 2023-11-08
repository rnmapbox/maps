#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXTerrainComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTBridge+Private.h>
#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNMBXTerrainComponentView () <RCTRNMBXTerrainViewProtocol>
@end

@implementation RNMBXTerrainComponentView {
    RNMBXTerrain *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXTerrainProps>();
    _props = defaultProps;
      [self prepareView];
    }

    return self;
  }

- (void)prepareView
{
  _view =  [[RNMBXTerrain alloc] init];
  _view.bridge = [RCTBridge currentBridge];
  self.contentView = _view;
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    [self prepareView];
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXTerrainComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = static_cast<const RNMBXTerrainProps &>(*props);

    id sourceID = RNMBXConvertFollyDynamicToId(newProps.sourceID);
    if (sourceID != nil) {
        _view.sourceID = sourceID;
    }
    id reactStyle = RNMBXConvertFollyDynamicToId(newProps.reactStyle);
    if (reactStyle != nil) {
        _view.reactStyle = reactStyle;
    }
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> RNMBXTerrainCls(void)
{
  return RNMBXTerrainComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
