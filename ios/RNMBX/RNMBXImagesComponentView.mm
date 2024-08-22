#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXImagesComponentView.h"
#import "RNMBXFabricHelpers.h"

#include "RNMBXImageComponentView.h"

#import <React/RCTBridge+Private.h>
#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNMBXImagesComponentView () <RCTRNMBXImagesViewProtocol>
@end

@implementation RNMBXImagesComponentView {
    RNMBXImages *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXImagesProps>();
    _props = defaultProps;
      [self prepareView];
  }

  return self;
}

- (void)prepareView
{
    _view = [[RNMBXImages alloc] init];
    _view.bridge = [RCTBridge currentBridge];

      // capture weak self reference to prevent retain cycle
      __weak __typeof__(self) weakSelf = self;
      
      [_view setOnImageMissing:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;

          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              std::string type = [event valueForKey:@"type"] == nil ? "" : std::string([[event valueForKey:@"type"] UTF8String]);
              std::string imageKey =  (![[event valueForKey:@"payload"] isKindOfClass:[NSDictionary class]] || ![[[event valueForKey:@"payload"] valueForKey:@"imageKey"] isKindOfClass:[NSString class]]) ? "" : std::string([((NSDictionary *)event[@"payload"])[@"imageKey"] UTF8String]);
              facebook::react::RNMBXImagesEventEmitter::OnImageMissingPayload payload = {.imageKey = imageKey};
              std::dynamic_pointer_cast<const facebook::react::RNMBXImagesEventEmitter>(strongSelf->_eventEmitter)->onImageMissing({type, payload});
            }
      }];
    self.contentView = _view;
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    [self prepareView];
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXImagesComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
    const auto &newProps = static_cast<const RNMBXImagesProps &>(*props);
    id images = RNMBXConvertFollyDynamicToId(newProps.images);
    if (images != nil) {
        _view.images = images;
    }
    id nativeImages = RNMBXConvertFollyDynamicToId(newProps.nativeImages);
    if (nativeImages != nil) {
        _view.nativeImages = nativeImages;
    }

  [super updateProps:props oldProps:oldProps];
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    if ([childComponentView isKindOfClass:[RNMBXImageComponentView class]] && ((RNMBXImageComponentView *)childComponentView).contentView) {
        [_view addImageView:((RNMBXImageComponentView *)childComponentView).contentView];
    }
    [super mountChildComponentView:childComponentView index:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    if ([childComponentView isKindOfClass:[RCTViewComponentView class]] && ((RCTViewComponentView *)childComponentView).contentView) {
        [_view removeImageView:((RCTViewComponentView *)childComponentView).contentView];
    }
    [super unmountChildComponentView:childComponentView index:index];
}

@end

Class<RCTComponentViewProtocol> RNMBXImagesCls(void)
{
  return RNMBXImagesComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
