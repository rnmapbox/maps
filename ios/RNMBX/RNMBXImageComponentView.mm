#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXImageComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNMBXImageComponentView () <RCTRNMBXImageViewProtocol>
@end

@implementation RNMBXImageComponentView {
    RNMBXImage *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXImageProps>();
    _props = defaultProps;
      [self prepareView];
    }

    return self;
  }

- (void)prepareView
{
  _view =  [[RNMBXImage alloc] init];
  self.contentView = _view;
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    if ([childComponentView isKindOfClass:[RCTViewComponentView class]] && ((RCTViewComponentView *)childComponentView).contentView != nil) {
        [_view insertReactSubviewInternal:((RCTViewComponentView *)childComponentView).contentView at:index];
    } else {
        [_view insertReactSubviewInternal:childComponentView at:index];
    }
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    if ([childComponentView isKindOfClass:[RCTViewComponentView class]] && ((RCTViewComponentView *)childComponentView).contentView != nil) {
        [_view removeReactSubviewInternal:((RCTViewComponentView *)childComponentView).contentView];
    } else {
        [_view removeReactSubviewInternal:childComponentView];
    }
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXImageComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = static_cast<const RNMBXImageProps &>(*props);
    id stretchX = RNMBXConvertFollyDynamicToId(newProps.stretchX);
    if (stretchX != nil) {
        _view.stretchX = stretchX;
    }
    id stretchY = RNMBXConvertFollyDynamicToId(newProps.stretchY);
    if (stretchY != nil) {
        _view.stretchY = stretchY;
    }
    id content = RNMBXConvertFollyDynamicToId(newProps.content);
    if (content != nil) {
        _view.content = content;
    }
    id sdf = RNMBXConvertFollyDynamicToId(newProps.sdf);
    if (sdf != nil) {
        _view.sdf = sdf;
    }
    id name = RNMBXConvertFollyDynamicToId(newProps.name);
    if (name != nil) {
        _view.name = name;
    }
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> RNMBXImageCls(void)
{
  return RNMBXImageComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
