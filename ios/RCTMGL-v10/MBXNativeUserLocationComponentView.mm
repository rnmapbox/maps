#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXNativeUserLocationComponentView.h"

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

@interface MBXNativeUserLocationComponentView () <RCTMBXNativeUserLocationViewProtocol>
@end

@implementation MBXNativeUserLocationComponentView {
    MBXNativeUserLocation *_view;
}

@synthesize mapFeature;

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXNativeUserLocationProps>();
    _props = defaultProps;
    _view = [[MBXNativeUserLocation alloc] init];
      
    self.contentView = _view;
    self.mapFeature = _view;
  }

  return self;
}

- (void)insertSubview:(UIView *)view atIndex:(NSInteger)index
{
    [self.contentView insertSubview:view atIndex:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    if (childComponentView.superview == self.contentView) {
        [childComponentView removeFromSuperview];
    } else {
        [super unmountChildComponentView:childComponentView index:index];
    }
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MBXNativeUserLocationComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXNativeUserLocationProps>(props);
    
    _view.iosShowsUserHeadingIndicator = newProps.iosShowsUserHeadingIndicator;
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXNativeUserLocationCls(void)
{
  return MBXNativeUserLocationComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
