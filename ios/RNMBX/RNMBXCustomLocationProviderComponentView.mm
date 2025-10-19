#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXCustomLocationProviderComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>
#import <React/RCTBridge+Private.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

#import "RNMBXFabricPropConvert.h"

using namespace facebook::react;

@interface RNMBXCustomLocationProviderComponentView () <RCTRNMBXCustomLocationProviderViewProtocol>
@end

@implementation RNMBXCustomLocationProviderComponentView {
    RNMBXCustomLocationProvider *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXCustomLocationProviderProps>();
    _props = defaultProps;
      [self prepareView];
  }

  return self;
}

- (void)prepareView
{
  _view =  [[RNMBXCustomLocationProvider alloc] init];
  //_view.bridge = [RCTBridge currentBridge];
  self.contentView = _view;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXCustomLocationProviderComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldViewProps = static_cast<const RNMBXCustomLocationProviderProps &>(*oldProps);
  const auto &newViewProps = static_cast<const RNMBXCustomLocationProviderProps &>(*props);

  RNMBX_OPTIONAL_PROP_NumberArray(coordinate)
  RNMBX_OPTIONAL_PROP_NSNumber(heading)

  [super updateProps:props oldProps:oldProps];

  [_view didSetProps:@[]];
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    [self prepareView];
}

@end

Class<RCTComponentViewProtocol> RNMBXCustomLocationProviderCls(void)
{
  return RNMBXCustomLocationProviderComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
