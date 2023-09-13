#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXImageSourceComponentView.h"
#import "MBXFabricHelpers.h"

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

@interface MBXImageSourceComponentView () <RCTMBXImageSourceViewProtocol>
@end

@implementation MBXImageSourceComponentView {
    MBXImageSource *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXImageSourceProps>();
    _props = defaultProps;
    _view = [[MBXImageSource alloc] init];
      
    self.contentView = _view;
  }

  return self;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MBXImageSourceComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXImageSourceProps>(props);
    _view.id = RCTNSStringFromStringNilIfEmpty(newProps.id);
    _view.existing = newProps.existing;
    _view.url = RCTNSStringFromStringNilIfEmpty(newProps.url);
    _view.coordinates = RNMBXConvertDynamicArrayToArray(&newProps.coordinates);
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXImageSourceCls(void)
{
  return MBXImageSourceComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
