#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXNativeUserLocationComponentView.h"
#import "RNMBXFabricHelpers.h"
#import "RNMBXFabricPropConvert.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNMBXNativeUserLocationComponentView () <RCTRNMBXNativeUserLocationViewProtocol>
@end

@implementation RNMBXNativeUserLocationComponentView {
    RNMBXNativeUserLocation *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXNativeUserLocationProps>();
    _props = defaultProps;
      [self prepareView];
    }

    return self;
  }

- (void)prepareView
{
  _view =  [[RNMBXNativeUserLocation alloc] init];
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
  return concreteComponentDescriptorProvider<RNMBXNativeUserLocationComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldViewProps = static_cast<const RNMBXNativeUserLocationProps &>(*oldProps);
  const auto &newViewProps = static_cast<const RNMBXNativeUserLocationProps &>(*props);

  RNMBX_OPTIONAL_PROP_NSString(puckBearing)
  RNMBX_OPTIONAL_PROP_BOOL(puckBearingEnabled)
  RNMBX_OPTIONAL_PROP_NSString(bearingImage)
  RNMBX_OPTIONAL_PROP_NSString(shadowImage)
  RNMBX_OPTIONAL_PROP_NSString(topImage)
  RNMBX_OPTIONAL_PROP_ExpressionDouble(scale)
  RNMBX_PROP_BOOL(visible)
  RNMBX_OPTIONAL_PROP_NSDictionary(pulsing)

  [super updateProps:props oldProps:oldProps];

  [_view didSetProps:@[]];
}

@end

Class<RCTComponentViewProtocol> RNMBXNativeUserLocationCls(void)
{
  return RNMBXNativeUserLocationComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
