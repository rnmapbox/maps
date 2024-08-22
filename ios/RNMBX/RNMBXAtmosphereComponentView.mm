#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXAtmosphereComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTBridge+Private.h>
#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNMBXAtmosphereComponentView () <RCTRNMBXAtmosphereViewProtocol>
@end

@implementation RNMBXAtmosphereComponentView {
    RNMBXAtmosphere *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const RNMBXAtmosphereProps>();
        _props = defaultProps;
        [self prepareView];
    }

    return self;
}

- (void)prepareView
{
    _view =  [[RNMBXAtmosphere alloc] init];
    _view.bridge = [RCTBridge currentBridge];

    self.contentView = _view;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXAtmosphereComponentDescriptor>();
}


- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = static_cast<const RNMBXAtmosphereProps &>(*props);
    id reactStyle = RNMBXConvertFollyDynamicToId(newProps.reactStyle);
    if (reactStyle != nil) {
        _view.reactStyle = reactStyle;
    }
    
  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    [self prepareView];
}


@end

Class<RCTComponentViewProtocol> RNMBXAtmosphereCls(void)
{
  return RNMBXAtmosphereComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
