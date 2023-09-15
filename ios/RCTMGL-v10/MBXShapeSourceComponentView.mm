#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXShapeSourceComponentView.h"
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

@interface MBXShapeSourceComponentView () <RCTMBXShapeSourceViewProtocol>
@end

@implementation MBXShapeSourceComponentView {
    MBXShapeSource *_view;
}

@synthesize mapFeature;

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXShapeSourceProps>();
    _props = defaultProps;
    _view = [[MBXShapeSource alloc] init];
      
      
    // capture weak self reference to prevent retain cycle
    __weak __typeof__(self) weakSelf = self;

    [_view setOnPress:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, json] = RNMBXStringifyEventData(event);
            std::dynamic_pointer_cast<const facebook::react::MBXShapeSourceEventEmitter>(strongSelf->_eventEmitter)->onMapboxShapeSourcePress({type, json});
          }
    }];
      
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

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MBXShapeSourceComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXShapeSourceProps>(props);
    _view.id = RCTNSStringFromStringNilIfEmpty(newProps.id);
    _view.existing = newProps.existing;
    _view.shape = RCTNSStringFromStringNilIfEmpty(newProps.shape);
    _view.cluster = @(newProps.cluster);
    _view.clusterRadius = @(newProps.clusterRadius);
    _view.clusterMaxZoomLevel = @(newProps.clusterMaxZoomLevel);
    _view.clusterProperties = RNMBXConvertDynamicToDictionary(&newProps.clusterProperties);
    _view.maxZoomLevel = @(newProps.maxZoomLevel);
    _view.buffer = @(newProps.buffer);
    _view.tolerance = @(newProps.tolerance);
    _view.lineMetrics = @(newProps.lineMetrics);
    _view.hasPressListener = newProps.hasPressListener;
    _view.hitbox = RNMBXConvertDynamicToDictionary(&newProps.hitbox);    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXShapeSourceCls(void)
{
  return MBXShapeSourceComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
