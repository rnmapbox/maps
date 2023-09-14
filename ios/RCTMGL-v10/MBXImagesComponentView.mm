#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXImagesComponentView.h"
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

@interface MBXImagesComponentView () <RCTMBXImagesViewProtocol>
@end

@implementation MBXImagesComponentView {
    MBXImages *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXImagesProps>();
    _props = defaultProps;
    _view = [[MBXImages alloc] init];
      
            // capture weak self reference to prevent retain cycle
      __weak __typeof__(self) weakSelf = self;
      
      [_view setOnImageMissing:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;

          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              std::string type = [event valueForKey:@"type"] == nil ? "" : std::string([[event valueForKey:@"type"] UTF8String]);
              std::string imageKey =  (![[event valueForKey:@"payload"] isKindOfClass:[NSDictionary class]] || ![[[event valueForKey:@"payload"] valueForKey:@"imageKey"] isKindOfClass:[NSString class]]) ? "" : std::string([((NSDictionary *)event[@"payload"])[@"imageKey"] UTF8String]);
              facebook::react::MBXImagesEventEmitter::OnImageMissingPayload payload = {.imageKey = imageKey};
              std::dynamic_pointer_cast<const facebook::react::MBXImagesEventEmitter>(strongSelf->_eventEmitter)->onImageMissing({type, payload});
            }
      }];
    self.contentView = _view;
  }

  return self;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MBXImagesComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXImagesProps>(props);
    _view.images = RNMBXConvertDynamicToDictionary(&newProps.images);
    _view.nativeImages = RNMBXConvertDynamicArrayToArray(&newProps.nativeImages);

  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXImagesCls(void)
{
  return MBXImagesComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
