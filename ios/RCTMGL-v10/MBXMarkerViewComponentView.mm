#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXMarkerViewComponentView.h"

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

@interface MBXMarkerViewComponentView () <RCTMBXMarkerViewViewProtocol>
@end

@implementation MBXMarkerViewComponentView {
    MBXMarkerView *_view;
}

@synthesize mapFeature;

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXMarkerViewProps>();
    _props = defaultProps;
    _view = [[MBXMarkerView alloc] init];
      
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
  return concreteComponentDescriptorProvider<MBXMarkerViewComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXMarkerViewProps>(props);
    
    _view.coordinate = [NSString stringWithCString:newProps.coordinate.c_str()
                                          encoding:[NSString defaultCStringEncoding]];
    _view.anchor = @{@"x": [NSNumber numberWithInt:newProps.anchor.x], @"y": [NSNumber numberWithInt:newProps.anchor.y]};
    _view.allowOverlap = newProps.allowOverlap;
    _view.isSelected = newProps.isSelected;
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXMarkerViewCls(void)
{
  return MBXMarkerViewComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
