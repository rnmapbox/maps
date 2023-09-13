#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXRasterSourceComponentView.h"

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

@interface MBXRasterSourceComponentView () <RCTMBXRasterSourceViewProtocol>
@end

@implementation MBXRasterSourceComponentView {
    MBXRasterSource *_view;
}

@synthesize mapFeature;

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXRasterSourceProps>();
    _props = defaultProps;
    _view = [[MBXRasterSource alloc] init];
      
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

+ (NSArray<NSString *> *)convertArrayOfString:(std::vector<std::string>)stringArray
{
    NSMutableArray<NSString *> *result = [NSMutableArray new];
    for (auto string : stringArray) {
        [result addObject:RCTNSStringFromStringNilIfEmpty(string)];
    }
    return result;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MBXRasterSourceComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXRasterSourceProps>(props);
    _view.id = RCTNSStringFromStringNilIfEmpty(newProps.id);
    _view.existing = newProps.existing;
    _view.url = RCTNSStringFromStringNilIfEmpty(newProps.url);
    _view.tileUrlTemplates = [MBXRasterSourceComponentView convertArrayOfString:newProps.tileUrlTemplates];

    _view.tileSize = @(newProps.tileSize);
    _view.minZoomLevel = @(newProps.minZoomLevel);
    _view.maxZoomLevel = @(newProps.maxZoomLevel);

    _view.tms = @(newProps.tms);
    _view.attribution = RCTNSStringFromStringNilIfEmpty(newProps.attribution);
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXRasterSourceCls(void)
{
  return MBXRasterSourceComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
