#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXVectorSourceComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNMBXVectorSourceComponentView () <RCTRNMBXVectorSourceViewProtocol>
@end

@implementation RNMBXVectorSourceComponentView {
    RNMBXVectorSource *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXVectorSourceProps>();
    _props = defaultProps;
    [self prepareView];
  }

  return self;
}

- (void)prepareView
{
    _view = [[RNMBXVectorSource alloc] init];
      
    // capture weak self reference to prevent retain cycle
    __weak __typeof__(self) weakSelf = self;

    [_view setOnPress:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, json] = RNMBXStringifyEventData(event);
            std::dynamic_pointer_cast<const facebook::react::RNMBXVectorSourceEventEmitter>(strongSelf->_eventEmitter)->onMapboxVectorSourcePress({type, json});
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
    if ([childComponentView isKindOfClass:[RCTViewComponentView class]]) {
        [_view insertReactSubviewInternal:((RCTViewComponentView *)childComponentView).contentView at:index];
    } else {
        RCTLogError(@"Tried to add view that is not RCTViewComponentView: %@", childComponentView);
    }
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    if ([childComponentView isKindOfClass:[RCTViewComponentView class]]) {
        [_view removeReactSubviewInternal:((RCTViewComponentView *)childComponentView).contentView];
    } else {
        RCTLogError(@"Tried to remove view that is not RCTViewComponentView: %@", childComponentView);
    }
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXVectorSourceComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = static_cast<const RNMBXVectorSourceProps &>(*props);
    id idx = RNMBXConvertFollyDynamicToId(newProps.id);
    if (idx != nil) {
        _view.id = idx;
    }
    id existing = RNMBXConvertFollyDynamicToId(newProps.existing);
    if (existing != nil) {
        _view.existing = existing;
    }
    id url = RNMBXConvertFollyDynamicToId(newProps.url);
    if (url != nil) {
        _view.url = url;
    }
    id tileUrlTemplates = RNMBXConvertFollyDynamicToId(newProps.tileUrlTemplates);
    if (tileUrlTemplates != nil) {
        _view.tileUrlTemplates = tileUrlTemplates;
    }
    id minZoomLevel = RNMBXConvertFollyDynamicToId(newProps.minZoomLevel);
    if (minZoomLevel != nil) {
        _view.minZoomLevel = minZoomLevel;
    }
    id maxZoomLevel = RNMBXConvertFollyDynamicToId(newProps.maxZoomLevel);
    if (maxZoomLevel != nil) {
        _view.maxZoomLevel = maxZoomLevel;
    }
    id tms = RNMBXConvertFollyDynamicToId(newProps.tms);
    if (tms != nil) {
        _view.tms = tms;
    }
    id attribution = RNMBXConvertFollyDynamicToId(newProps.attribution);
    if (attribution != nil) {
        _view.attribution = attribution;
    }
    id hasPressListener = RNMBXConvertFollyDynamicToId(newProps.hasPressListener);
    if (hasPressListener != nil) {
        _view.hasPressListener = hasPressListener;
    }
    id hitbox = RNMBXConvertFollyDynamicToId(newProps.hitbox);
    if (hitbox != nil) {
        _view.hitbox = hitbox;
    }
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> RNMBXVectorSourceCls(void)
{
  return RNMBXVectorSourceComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
