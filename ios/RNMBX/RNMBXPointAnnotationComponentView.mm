
#import "RNMBXPointAnnotationComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

#import "RNMBXFabricPropConvert.h"

using namespace facebook::react;

@interface RNMBXPointAnnotationComponentView () <RCTRNMBXPointAnnotationViewProtocol>
@end

@implementation RNMBXPointAnnotationComponentView {
    RNMBXPointAnnotation *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXPointAnnotationProps>();
    _props = defaultProps;
    [self prepareView];
  }

  return self;
}

- (void)prepareView
{
    _view = [[RNMBXPointAnnotation alloc] init];

    self.contentView = _view;

    // capture weak self reference to prevent retain cycle
    __weak __typeof__(self) weakSelf = self;

    [_view setOnDrag:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, json] = RNMBXStringifyEventData(event);
            std::dynamic_pointer_cast<const facebook::react::RNMBXPointAnnotationEventEmitter>(strongSelf->_eventEmitter)->onMapboxPointAnnotationDrag({type, json});
          }
    }];
    [_view setOnDragEnd:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, json] = RNMBXStringifyEventData(event);
            std::dynamic_pointer_cast<const facebook::react::RNMBXPointAnnotationEventEmitter>(strongSelf->_eventEmitter)->onMapboxPointAnnotationDragEnd({type, json});
          }
    }];
    [_view setOnDragStart:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, json] = RNMBXStringifyEventData(event);
            std::dynamic_pointer_cast<const facebook::react::RNMBXPointAnnotationEventEmitter>(strongSelf->_eventEmitter)->onMapboxPointAnnotationDragStart({type, json});
          }
    }];
    [_view setOnSelected:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, json] = RNMBXStringifyEventData(event);
            std::dynamic_pointer_cast<const facebook::react::RNMBXPointAnnotationEventEmitter>(strongSelf->_eventEmitter)->onMapboxPointAnnotationSelected({type, json});
          }
    }];
    [_view setOnDeselected:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, json] = RNMBXStringifyEventData(event);
            std::dynamic_pointer_cast<const facebook::react::RNMBXPointAnnotationEventEmitter>(strongSelf->_eventEmitter)->onMapboxPointAnnotationDeselected({type, json});
          }
    }];
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    [self prepareView];
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXPointAnnotationComponentDescriptor>();
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


- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldViewProps = static_cast<const RNMBXPointAnnotationProps &>(*oldProps);
  const auto &newViewProps = static_cast<const RNMBXPointAnnotationProps &>(*props);

  RNMBX_OPTIONAL_PROP_NSString(coordinate)
  RNMBX_OPTIONAL_PROP_BOOL(draggable)
  RNMBX_OPTIONAL_PROP_NSString(id)
  RNMBX_OPTIONAL_PROP_NSDictionary(anchor)

  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> RNMBXPointAnnotationCls(void)
{
  return RNMBXPointAnnotationComponentView.class;
}

