#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXAtmosphereComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>
// needed for compilation for some reason
#import <CoreFoundation/CoreFoundation.h>
#import <CoreLocation/CoreLocation.h>

@interface MapView : UIView
@end

#import <rnmapbox_maps-Swift.h>

using namespace facebook::react;

@interface RNMBXAtmosphereComponentView () <RCTRNMBXAtmosphereViewProtocol>
@end

@implementation RNMBXAtmosphereComponentView {
    RNMBXAtmosphere *_view;
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

    self.contentView = _view;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXAtmosphereComponentDescriptor>();
}


- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const RNMBXAtmosphereProps>(props);
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
