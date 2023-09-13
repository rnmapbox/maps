#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXTerrainComponentView.h"
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

@interface MBXTerrainComponentView () <RCTMBXTerrainViewProtocol>
@end

@implementation MBXTerrainComponentView {
    MBXTerrain *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXTerrainProps>();
    _props = defaultProps;
    _view = [[MBXTerrain alloc] init];
      
    self.contentView = _view;
  }

  return self;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MBXTerrainComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXTerrainProps>(props);
    
    _view.sourceID = RCTNSStringFromStringNilIfEmpty(newProps.sourceID);
    _view.reactStyle = RNMBXConvertDynamicToDictionary(&newProps.reactStyle);

    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXTerrainCls(void)
{
  return MBXTerrainComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
