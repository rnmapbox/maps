#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXRasterDemSourceComponentView.h"
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

@interface MBXRasterDemSourceComponentView () <RCTMBXRasterDemSourceViewProtocol>
@end

@implementation MBXRasterDemSourceComponentView {
    MBXRasterDemSource *_view;
}

@synthesize mapFeature;

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXRasterDemSourceProps>();
    _props = defaultProps;
    _view = [[MBXRasterDemSource alloc] init];
      
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
  return concreteComponentDescriptorProvider<MBXRasterDemSourceComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXRasterDemSourceProps>(props);
    
    _view.id = RCTNSStringFromStringNilIfEmpty(newProps.id);
    _view.existing = newProps.existing;
    _view.url = RCTNSStringFromStringNilIfEmpty(newProps.url);
    _view.tileUrlTemplates = RNMBXConvertArrayOfString(newProps.tileUrlTemplates);
    _view.minZoomLevel = @(newProps.minZoomLevel);
    _view.maxZoomLevel = @(newProps.maxZoomLevel);
    _view.tileSize = @(newProps.tileSize);
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXRasterDemSourceCls(void)
{
  return MBXRasterDemSourceComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
