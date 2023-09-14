#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXVectorSourceComponentView.h"
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

@interface MBXVectorSourceComponentView () <RCTMBXVectorSourceViewProtocol>
@end

@implementation MBXVectorSourceComponentView {
    MBXVectorSource *_view;
}

@synthesize mapFeature;

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXVectorSourceProps>();
    _props = defaultProps;
    _view = [[MBXVectorSource alloc] init];
      
    // capture weak self reference to prevent retain cycle
    __weak __typeof__(self) weakSelf = self;

    [_view setOnPress:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, json] = RNMBXStringifyEventData(event);
            std::dynamic_pointer_cast<const facebook::react::MBXVectorSourceEventEmitter>(strongSelf->_eventEmitter)->onMapboxVectorSourcePress({type, json});
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
  return concreteComponentDescriptorProvider<MBXVectorSourceComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXVectorSourceProps>(props);
    _view.id = RCTNSStringFromStringNilIfEmpty(newProps.id);
    _view.existing = newProps.existing;
    _view.url = RCTNSStringFromStringNilIfEmpty(newProps.url);
    _view.tileUrlTemplates = RNMBXConvertArrayOfString(newProps.tileUrlTemplates);

    _view.minZoomLevel = @(newProps.minZoomLevel);
    _view.maxZoomLevel = @(newProps.maxZoomLevel);

    _view.tms = @(newProps.tms);
    _view.attribution = RCTNSStringFromStringNilIfEmpty(newProps.attribution);
    _view.hasPressListener = newProps.hasPressListener;
    _view.hitbox = RNMBXConvertDynamicToDictionary(&newProps.hitbox);
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXVectorSourceCls(void)
{
  return MBXVectorSourceComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
