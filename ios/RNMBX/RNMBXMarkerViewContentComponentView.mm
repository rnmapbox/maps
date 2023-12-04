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
}

- (instancetype)initWithFrame:(CGRect)frame
{
  return [super initWithFrame:frame];
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
