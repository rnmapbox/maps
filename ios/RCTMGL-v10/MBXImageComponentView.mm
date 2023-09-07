#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXImageComponentView.h"

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

@interface MBXImageComponentView () <RCTMBXImageViewProtocol>
@end

@implementation MBXImageComponentView {
    MBXImage *_view;
}

@synthesize mapFeature;

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXImageProps>();
    _props = defaultProps;
    _view = [[MBXImage alloc] init];
      
    self.contentView = _view;
    self.mapFeature = _view;
  }

  return self;
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    [((NSMutableArray *)_view.reactSubviews) insertObject:childComponentView atIndex:index];
  if (_view.reactSubviews.count > 1) {
      RCTLogError(@"MBXImage supports max 1 subview");
  }
  if (_view.image == nil) {
      dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 10 * 1000), dispatch_get_main_queue(), ^{
          [self->_view setImage];
      });
  }
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    [((NSMutableArray *)_view.reactSubviews) removeObject:childComponentView];
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MBXImageComponentDescriptor>();
}

+ (NSArray<NSArray<NSNumber *> *> *)convertStretch:(const std::vector<folly::dynamic> *)stretch {
    NSMutableArray<NSMutableArray<NSNumber *> *> *result = [[NSMutableArray alloc] init];

    for (auto& arr : *stretch) {
        NSMutableArray<NSNumber *> *innerArr = [[NSMutableArray alloc] init];
        for (auto& num : arr) {
            if (!num.isNull()) {
                [innerArr addObject:@(num.getDouble())];
            }
        }
        [result addObject:innerArr];
    }
    return result;
}

+ (NSArray<NSNumber *> *)convertContent:(const std::vector<double> *)content {
    NSMutableArray<NSNumber *> *result = [[NSMutableArray alloc] init];
    for (auto& num : *content) {
        [result addObject:@(num)];
    }
    return result;
}


- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXImageProps>(props);
    _view.stretchX = [MBXImageComponentView convertStretch:&newProps.stretchX];
    _view.stretchY =  [MBXImageComponentView convertStretch:&newProps.stretchY];
    _view.content = [MBXImageComponentView convertContent:&newProps.content];;
    _view.sdf = newProps.sdf;
    _view.name = RCTNSStringFromStringNilIfEmpty(newProps.name);
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXImageCls(void)
{
  return MBXImageComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
