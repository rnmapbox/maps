#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXAtmosphereComponentView.h"

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

@interface MBXAtmosphereComponentView () <RCTMBXAtmosphereViewProtocol>
@end

@implementation MBXAtmosphereComponentView {
    MBXAtmosphere *_view;
}

@synthesize mapFeature;

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXAtmosphereProps>();
    _props = defaultProps;
    _view = [[MBXAtmosphere alloc] init];
      
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
  return concreteComponentDescriptorProvider<MBXAtmosphereComponentDescriptor>();
}

+ (NSDictionary*)convertDynamicToDictionary:(const folly::dynamic*)dynamic {
    NSMutableDictionary<NSString*, NSNumber*>* result = [[NSMutableDictionary alloc] init];

    if (!dynamic->isNull()) {
        for (auto& pair : dynamic->items()) {
            NSString* key = [NSString stringWithUTF8String:pair.first.getString().c_str()];
            NSNumber* value = [[NSNumber alloc] initWithInt:pair.second.getDouble()];
            [result setValue:value forKey:key];
        }
    }

    return result;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXAtmosphereProps>(props);
    _view.reactStyle = [MBXAtmosphereComponentView convertDynamicToDictionary:&newProps.reactStyle];
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXAtmosphereCls(void)
{
  return MBXAtmosphereComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
