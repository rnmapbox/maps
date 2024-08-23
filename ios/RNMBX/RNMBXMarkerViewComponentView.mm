#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXMarkerViewComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNMBXMarkerViewComponentView () <RCTRNMBXMarkerViewViewProtocol>
@end

@implementation RNMBXMarkerViewComponentView {
    RNMBXMarkerView *_view;
}

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXMarkerViewProps>();
    _props = defaultProps;
    [self prepareView];
  }

  return self;
}

- (void)prepareView
{
  _view =  [[RNMBXMarkerView alloc] init];
  self.contentView = _view;
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  [self prepareView];
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [_view insertSubview:childComponentView atIndex:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [childComponentView removeFromSuperview];
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXMarkerViewComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = static_cast<const RNMBXMarkerViewProps &>(*props);
    
    id coordinate = RNMBXConvertFollyDynamicToId(newProps.coordinate);
    if (coordinate != nil) {
        _view.coordinate = coordinate;
    }
    id anchor = RNMBXConvertFollyDynamicToId(newProps.anchor);
    if (anchor != nil) {
        _view.anchor = anchor;
    }
    id allowOverlap = RNMBXConvertFollyDynamicToId(newProps.allowOverlap);
    if (allowOverlap != nil) {
        _view.allowOverlap = allowOverlap;
    }
    id allowOverlapWithPuck = RNMBXConvertFollyDynamicToId(newProps.allowOverlapWithPuck);
    if (allowOverlapWithPuck != nil) {
        _view.allowOverlapWithPuck = allowOverlapWithPuck;
    }
    id isSelected = RNMBXConvertFollyDynamicToId(newProps.isSelected);
    if (isSelected != nil) {
        _view.isSelected = isSelected;
    }

  [super updateProps:props oldProps:oldProps];
}

- (void)updateLayoutMetrics:(const LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const LayoutMetrics &)oldLayoutMetrics
{
    CGRect prev = _view.frame;
    CGRect next = RCTCGRectFromRect(layoutMetrics.frame);
    
    BOOL frameDidChange = !CGRectEqualToRect(next, prev);
    if (frameDidChange) {
      next = CGRectMake(0, 0, next.size.width, next.size.height);
    }
    
    LayoutMetrics newLayoutMetrics = LayoutMetrics{
        RCTRectFromCGRect(next),
        layoutMetrics.contentInsets,
        layoutMetrics.borderWidth,
        layoutMetrics.displayType,
        layoutMetrics.positionType, // RN074
        layoutMetrics.layoutDirection,
        layoutMetrics.wasLeftAndRightSwapped,
        layoutMetrics.pointScaleFactor,
        layoutMetrics.overflowInset
    };

    [super updateLayoutMetrics:newLayoutMetrics oldLayoutMetrics:oldLayoutMetrics];
    if (frameDidChange) {
        [_view updateAnnotationViewSize:next :prev];
    }
    [_view addOrUpdate];
}

@end

Class<RCTComponentViewProtocol> RNMBXMarkerViewCls(void)
{
  return RNMBXMarkerViewComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
