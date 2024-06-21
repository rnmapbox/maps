#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXShapeSourceComponentView.h"
#import "RNMBXFabricHelpers.h"

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
    const auto &oldShapeSourceProps = static_cast<const RNMBXShapeSourceProps &>(*_props);
    const auto &newShapeSourceProps = static_cast<const RNMBXShapeSourceProps &>(*props);
    id idx = RNMBXConvertFollyDynamicToId(newShapeSourceProps.id);
    if (idx != nil) {
        _view.id = idx;
    }
    id existing = RNMBXConvertFollyDynamicToId(newShapeSourceProps.existing);
    if (existing != nil) {
        _view.existing = existing;
    }
    id shape = RNMBXConvertFollyDynamicToId(newShapeSourceProps.shape);
    if (shape != nil) {
        _view.shape = shape;
    }
    id cluster = RNMBXConvertFollyDynamicToId(newShapeSourceProps.cluster);
    if (cluster != nil) {
        _view.cluster = cluster;
    }
    id clusterRadius = RNMBXConvertFollyDynamicToId(newShapeSourceProps.clusterRadius);
    if (clusterRadius != nil) {
        _view.clusterRadius = clusterRadius;
    }
    if (oldShapeSourceProps.clusterMaxZoomLevel != newShapeSourceProps.clusterMaxZoomLevel) {
        id clusterMaxZoomLevel = RNMBXConvertFollyDynamicToId(newShapeSourceProps.clusterMaxZoomLevel);
        if (clusterMaxZoomLevel != nil) {
            _view.clusterMaxZoomLevel = clusterMaxZoomLevel;
        }
    }
    id clusterProperties = RNMBXConvertFollyDynamicToId(newShapeSourceProps.clusterProperties);
    if (clusterProperties != nil) {
        _view.clusterProperties = clusterProperties;
    }
    id maxZoomLevel = RNMBXConvertFollyDynamicToId(newShapeSourceProps.maxZoomLevel);
    if (maxZoomLevel != nil) {
        _view.maxZoomLevel = maxZoomLevel;
    }
    id buffer = RNMBXConvertFollyDynamicToId(newShapeSourceProps.buffer);
    if (buffer != nil) {
        _view.buffer = buffer;
    }
    id tolerance = RNMBXConvertFollyDynamicToId(newShapeSourceProps.tolerance);
    if (tolerance != nil) {
        _view.tolerance = tolerance;
    }
    id lineMetrics = RNMBXConvertFollyDynamicToId(newShapeSourceProps.lineMetrics);
    if (lineMetrics != nil) {
        _view.lineMetrics = lineMetrics;
    }
    id hasPressListener = RNMBXConvertFollyDynamicToId(newShapeSourceProps.hasPressListener);
    if (hasPressListener != nil) {
        _view.hasPressListener = hasPressListener;
    }
    id hitbox = RNMBXConvertFollyDynamicToId(newShapeSourceProps.hitbox);
    if (hitbox != nil) {
        _view.hitbox = hitbox;
    }
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> RNMBXShapeSourceCls(void)
{
  return RNMBXShapeSourceComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
