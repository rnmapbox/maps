#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXMapViewComponentView.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps/Props.h>
#import <react/renderer/components/rnmapbox_maps/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface MBXMapViewComponentView () <RCTMBXMapViewViewProtocol>
@end

@implementation MBXMapViewComponentView {
  UIView *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXMapViewProps>();
    _props = defaultProps;
    _view = [[UIView alloc] initWithFrame:self.bounds];

    self.contentView = _view;
  }

  return self;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MBXMapViewComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXMapViewProps>(props);

    _view.backgroundColor = [UIColor greenColor];

  [super updateProps:props oldProps:oldProps];
}
@end

Class<RCTComponentViewProtocol> MBXMapViewCls(void)
{
  return MBXMapViewComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
