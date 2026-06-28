
#import "RNMBXPointAnnotationManagerComponentView.h"
#import "RNMBXFabricHelpers.h"
#import "RNMBXFabricPropConvert.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

#import "rnmapbox_maps-Swift.pre.h"

using namespace facebook::react;

@interface RNMBXPointAnnotationManagerComponentView () <RCTRNMBXPointAnnotationManagerViewProtocol>
@end

@implementation RNMBXPointAnnotationManagerComponentView {
  RNMBXPointAnnotationManagerView *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load {
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const RNMBXPointAnnotationManagerProps>();
    _props = defaultProps;
    [self prepareView];
  }

  return self;
}

- (void)prepareView {
  _view = [[RNMBXPointAnnotationManagerView alloc] init];
  self.contentView = _view;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      RNMBXPointAnnotationManagerComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props
           oldProps:(const Props::Shared &)oldProps {
  const auto &oldViewProps = static_cast<const RNMBXPointAnnotationManagerProps &>(*_props);
  const auto &newViewProps = static_cast<const RNMBXPointAnnotationManagerProps &>(*props);

  RNMBX_OPTIONAL_PROP_NSString(slot)

  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle {
  [super prepareForRecycle];
  [self prepareView];
}

@end

Class<RCTComponentViewProtocol> RNMBXPointAnnotationManagerCls(void) {
  return RNMBXPointAnnotationManagerComponentView.class;
}
