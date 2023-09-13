#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXSkyLayerComponentView.h"
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

@interface MBXSkyLayerComponentView () <RCTMBXSkyLayerViewProtocol>
@end

@implementation MBXSkyLayerComponentView {
    MBXSkyLayer *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXSkyLayerProps>();
    _props = defaultProps;
    _view = [[MBXSkyLayer alloc] init];
      
    self.contentView = _view;
  }

  return self;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MBXSkyLayerComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXSkyLayerProps>(props);
    _view.id = RCTNSStringFromStringNilIfEmpty(newProps.id);
    _view.sourceID = RCTNSStringFromStringNilIfEmpty(newProps.sourceID);
    _view.filter = RNMBXConvertDynamicArrayToArray(&newProps.filter);
    _view.aboveLayerID = RCTNSStringFromStringNilIfEmpty(newProps.aboveLayerID);
    _view.belowLayerID = RCTNSStringFromStringNilIfEmpty(newProps.belowLayerID);
    _view.layerIndex = @(newProps.layerIndex);
    _view.reactStyle = RNMBXConvertDynamicToDictionary(&newProps.reactStyle);
    _view.maxZoomLevel = @(newProps.maxZoomLevel);
    _view.minZoomLevel = @(newProps.minZoomLevel);

  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXSkyLayerCls(void)
{
  return MBXSkyLayerComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
