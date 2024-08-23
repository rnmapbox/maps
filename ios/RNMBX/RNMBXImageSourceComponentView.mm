#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXImageSourceComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNMBXImageSourceComponentView () <RCTRNMBXImageSourceViewProtocol>
@end

@implementation RNMBXImageSourceComponentView {
    RNMBXImageSource *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXImageSourceProps>();
    _props = defaultProps;
      [self prepareView];
  }

  return self;
}

- (void)prepareView
{
  _view =  [[RNMBXImageSource alloc] init];
  self.contentView = _view;
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    [self prepareView];
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    if ([childComponentView isKindOfClass:[RCTViewComponentView class]]) {
        [_view insertReactSubviewInternal:((RCTViewComponentView *)childComponentView).contentView at:index];
    } else {
        RCTLogError(@"Tried to add view that is not RCTViewComponentView: %@", childComponentView);
    }
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    if ([childComponentView isKindOfClass:[RCTViewComponentView class]]) {
        [_view removeReactSubviewInternal:((RCTViewComponentView *)childComponentView).contentView];
    } else {
        RCTLogError(@"Tried to remove view that is not RCTViewComponentView: %@", childComponentView);
    }
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXImageSourceComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = static_cast<const RNMBXImageSourceProps &>(*props);
    id idx = RNMBXConvertFollyDynamicToId(newProps.id);
    if (idx != nil) {
        _view.id = idx;
    }
    id existing = RNMBXConvertFollyDynamicToId(newProps.existing);
    if (existing != nil) {
        _view.existing = existing;
    }
    id url = RNMBXConvertFollyDynamicToId(newProps.url);
    if (url != nil) {
        _view.url = url;
    }
    id coordinates = RNMBXConvertFollyDynamicToId(newProps.coordinates);
    if (coordinates != nil) {
        _view.coordinates = coordinates;
    }
    [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> RNMBXImageSourceCls(void)
{
  return RNMBXImageSourceComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
