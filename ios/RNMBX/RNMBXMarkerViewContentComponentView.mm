#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXMarkerViewContentComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNMBXMarkerViewContentComponentView () <RCTRNMBXMarkerViewContentViewProtocol>
@end

@implementation RNMBXMarkerViewContentComponentView {
  UIView *_view;
  CGRect _frame;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXMarkerViewContentProps>();
    _props = defaultProps;
    _frame = frame;
  }
  return self;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXMarkerViewContentComponentDescriptor>();
}

@end

Class<RCTComponentViewProtocol> RNMBXMarkerViewContentCls(void)
{
  return RNMBXMarkerViewContentComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
