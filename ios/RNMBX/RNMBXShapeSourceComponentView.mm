#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXShapeSourceComponentView.h"
#import "RNMBXFabricHelpers.h"
#import "RNMBXFabricPropConvert.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNMBXShapeSourceComponentView () <RCTRNMBXShapeSourceViewProtocol>
@end

@implementation RNMBXShapeSourceComponentView {
    RNMBXShapeSource *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXShapeSourceProps>();
    _props = defaultProps;
    [self prepareView];
  }

  return self;
}

- (void)prepareView
{
    _view = [[RNMBXShapeSource alloc] init];
      
      
    // capture weak self reference to prevent retain cycle
    __weak __typeof__(self) weakSelf = self;

    [_view setOnPress:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, json] = RNMBXStringifyEventData(event);
            std::dynamic_pointer_cast<const facebook::react::RNMBXShapeSourceEventEmitter>(strongSelf->_eventEmitter)->onMapboxShapeSourcePress({type, json});
          }
    }];
      
    self.contentView = _view;
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  [self prepareView];
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
  return concreteComponentDescriptorProvider<RNMBXShapeSourceComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldViewProps = static_cast<const RNMBXShapeSourceProps &>(*_props);
  const auto &newViewProps = static_cast<const RNMBXShapeSourceProps &>(*props);

  RNMBX_OPTIONAL_PROP_NSString(id)
  RNMBX_OPTIONAL_PROP_BOOL(existing)
  RNMBX_OPTIONAL_PROP_NSString(shape)
  RNMBX_OPTIONAL_PROP_NSNumber(cluster)
  RNMBX_OPTIONAL_PROP_NSNumber(clusterRadius)
  RNMBX_OPTIONAL_PROP_NSNumber(clusterMaxZoomLevel)
  RNMBX_OPTIONAL_PROP_NSDictionary(clusterProperties)
  RNMBX_OPTIONAL_PROP_NSNumber(maxZoomLevel)
  RNMBX_OPTIONAL_PROP_NSNumber(buffer)
  RNMBX_OPTIONAL_PROP_NSNumber(tolerance)
  RNMBX_OPTIONAL_PROP_NSNumber(lineMetrics)
  RNMBX_OPTIONAL_PROP_BOOL(hasPressListener)
  RNMBX_OPTIONAL_PROP_NSDictionary(hitbox)
  
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> RNMBXShapeSourceCls(void)
{
  return RNMBXShapeSourceComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
