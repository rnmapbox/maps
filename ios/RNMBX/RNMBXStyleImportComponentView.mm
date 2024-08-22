#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXStyleImportComponentView.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

#import "rnmapbox_maps-Swift.pre.h"

using namespace facebook::react;

@implementation RNMBXStyleImportComponentView {
    RNMBXStyleImport *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXStyleImportProps>();
    _props = defaultProps;
    _view = [[RNMBXStyleImport alloc] init];
    
    self.contentView = _view;
  }
  
  return self;
}
@end

Class<RCTComponentViewProtocol> RNMBXStyleImportCls(void)
{
  return RNMBXStyleImportComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
