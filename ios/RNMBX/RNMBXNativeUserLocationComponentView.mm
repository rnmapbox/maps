#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXNativeUserLocationComponentView.h"
#import "RNMBXFabricHelpers.h"

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
  const auto &newProps = static_cast<const RNMBXNativeUserLocationProps &>(*props);
    id iosShowsUserHeadingIndicator = RNMBXConvertFollyDynamicToId(newProps.iosShowsUserHeadingIndicator);
    if (iosShowsUserHeadingIndicator != nil) {
        _view.iosShowsUserHeadingIndicator = iosShowsUserHeadingIndicator;
    }
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> RNMBXNativeUserLocationCls(void)
{
  return RNMBXNativeUserLocationComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
