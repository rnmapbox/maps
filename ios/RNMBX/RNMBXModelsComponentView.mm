#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXModelsComponentView.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

#import "rnmapbox_maps-Swift.pre.h"

#import "RCTFollyConvert.h"
#import "RNMBXFabricPropConvert.h"


// TODO: use generated RNMBXModelsEventEmitter, but need 0.73+ for dynamic support
using namespace facebook::react;

@implementation RNMBXModelsComponentView {
    RNMBXModels *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXModelsProps>();
    _props = defaultProps;
    _view = [[RNMBXModels alloc] init];
    [self prepareView];
    
    self.contentView = _view;
  }
  
  return self;
}

- (void)prepareView
{
}


#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXModelsComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldViewProps = static_cast<const RNMBXModelsProps &>(*oldProps);
  const auto &newViewProps = static_cast<const RNMBXModelsProps &>(*props);

  RNMBX_OPTIONAL_PROP_NSDictionary(models);
  [super updateProps:props oldProps:oldProps];
}
@end

Class<RCTComponentViewProtocol> RNMBXModelsCls(void)
{
  return RNMBXModelsComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
