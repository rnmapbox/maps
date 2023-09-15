#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXPointAnnotationComponentView.h"
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

@interface MBXPointAnnotationComponentView () <RCTMBXPointAnnotationViewProtocol>
@end

@implementation MBXPointAnnotationComponentView {
    MBXPointAnnotation *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXPointAnnotationProps>();
    _props = defaultProps;
    _view = [[MBXPointAnnotation alloc] init];
      
    self.contentView = _view;
      
    // capture weak self reference to prevent retain cycle
    __weak __typeof__(self) weakSelf = self;

    [_view setOnDrag:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, json] = RNMBXStringifyEventData(event);
            std::dynamic_pointer_cast<const facebook::react::MBXPointAnnotationEventEmitter>(strongSelf->_eventEmitter)->onMapboxPointAnnotationDrag({type, json});
          }
    }];
    [_view setOnDragEnd:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, json] = RNMBXStringifyEventData(event);
            std::dynamic_pointer_cast<const facebook::react::MBXPointAnnotationEventEmitter>(strongSelf->_eventEmitter)->onMapboxPointAnnotationDragEnd({type, json});
          }
    }];
    [_view setOnDragStart:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, json] = RNMBXStringifyEventData(event);
            std::dynamic_pointer_cast<const facebook::react::MBXPointAnnotationEventEmitter>(strongSelf->_eventEmitter)->onMapboxPointAnnotationDragStart({type, json});
          }
    }];
    [_view setOnSelected:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, json] = RNMBXStringifyEventData(event);
            std::dynamic_pointer_cast<const facebook::react::MBXPointAnnotationEventEmitter>(strongSelf->_eventEmitter)->onMapboxPointAnnotationSelected({type, json});
          }
    }];
    [_view setOnDeselected:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, json] = RNMBXStringifyEventData(event);
            std::dynamic_pointer_cast<const facebook::react::MBXPointAnnotationEventEmitter>(strongSelf->_eventEmitter)->onMapboxPointAnnotationDeselected({type, json});
          }
    }];
  }

  return self;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MBXPointAnnotationComponentDescriptor>();
}


- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXPointAnnotationProps>(props);
    _view.coordinate = RCTNSStringFromStringNilIfEmpty(newProps.coordinate);
    _view.draggable = newProps.draggable;
    _view.id = RCTNSStringFromStringNilIfEmpty(newProps.id);
    _view.anchor = RNMBXConvertDynamicToDictionary(&newProps.anchor);
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXPointAnnotationCls(void)
{
  return MBXPointAnnotationComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
