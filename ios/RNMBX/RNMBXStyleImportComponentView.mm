#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXStyleImportComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

#import "rnmapbox_maps-Swift.pre.h"

using namespace facebook::react;

@interface RNMBXStyleImportComponentView () <RCTRNMBXStyleImportViewProtocol>
@end

@implementation RNMBXStyleImportComponentView {
  RNMBXStyleImport *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load {
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const RNMBXStyleImportProps>();
    _props = defaultProps;
    [self prepareView];
  }

  return self;
}

- (void)prepareView {
  _view = [[RNMBXStyleImport alloc] init];
  self.contentView = _view;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      RNMBXStyleImportComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props
           oldProps:(const Props::Shared &)oldProps {
  const auto &newProps = static_cast<const RNMBXStyleImportProps &>(*props);

  id styleId = RNMBXConvertFollyDynamicToId(newProps.id);
  if (styleId != nil) {
    _view.id = styleId;
  }

  id existing = RNMBXConvertFollyDynamicToId(newProps.existing);
  if (existing != nil) {
    _view.existing = existing;
  }

  id config = RNMBXConvertFollyDynamicToId(newProps.config);
  if (config != nil) {
    _view.config = config;
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle {
  [super prepareForRecycle];
  [self prepareView];
}

@end

Class<RCTComponentViewProtocol> RNMBXStyleImportCls(void) {
  return RNMBXStyleImportComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
