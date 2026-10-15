
#import "RNMBXMarkerViewComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>
#import <React/RCTRootComponentView.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

#import "RNMBXFabricPropConvert.h"
#import "RNMBXMarkerViewContentComponentView.h"

#import <react/renderer/components/rnmapbox_maps_specs/RNMBXMarkerViewContentTranslations.h>

using namespace facebook::react;

@interface RNMBXMarkerViewComponentView () <RCTRNMBXMarkerViewViewProtocol>
@end

@implementation RNMBXMarkerViewComponentView {
    RNMBXMarkerView *_view;
    CGPoint _layoutOrigin;
    SurfaceId _publishedSurfaceId;
    std::optional<SurfaceId> _surfaceId;
    NSMutableSet<NSNumber *> *_publishedTags;
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

- (void)dealloc
{
  [self clearTranslations];
}

- (void)prepareView
{
  _view =  [[RNMBXMarkerView alloc] init];
  _publishedTags = [NSMutableSet new];
  __weak RNMBXMarkerViewComponentView *weakSelf = self;
  _view.onPositionChange = ^{
    [weakSelf publishTranslation];
  };
  self.contentView = _view;
}

- (void)prepareForRecycle
{
  [self clearTranslations];
  [super prepareForRecycle];
  [self prepareView];
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [_view insertSubview:childComponentView atIndex:index];
  [self publishTranslation];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  if ([_publishedTags containsObject:@(childComponentView.tag)]) {
    RNMBXMarkerViewContentTranslations::remove(_publishedSurfaceId, (Tag)childComponentView.tag);
    [_publishedTags removeObject:@(childComponentView.tag)];
  }
  [childComponentView removeFromSuperview];
}

#pragma mark - Translation

// Mapbox moves _view (inside its annotation view) while this component view stays at the map's
// origin, so the shadow tree doesn't know where the content is. Its shadow node reads the offset
// from RNMBXMarkerViewContentTranslations to make measure() match the screen (#3832).
- (void)publishTranslation
{
  if (self.window == nil || _view.window == nil) {
    return;
  }
  SurfaceId surfaceId = [self surfaceId];
  if (surfaceId == -1) {
    return;
  }
  if (surfaceId != _publishedSurfaceId) {
    [self clearTranslations];
    _publishedSurfaceId = surfaceId;
  }
  CGPoint origin = [_view convertPoint:CGPointZero toView:self];
  facebook::react::Point translation{
      .x = static_cast<Float>(origin.x - _layoutOrigin.x),
      .y = static_cast<Float>(origin.y - _layoutOrigin.y)};
  for (UIView *child in _view.subviews) {
    if ([child isKindOfClass:RNMBXMarkerViewContentComponentView.class]) {
      RNMBXMarkerViewContentTranslations::set(surfaceId, (Tag)child.tag, translation);
      [_publishedTags addObject:@(child.tag)];
    }
  }
}

- (void)clearTranslations
{
  for (NSNumber *tag in _publishedTags) {
    RNMBXMarkerViewContentTranslations::remove(_publishedSurfaceId, tag.intValue);
  }
  [_publishedTags removeAllObjects];
}

- (SurfaceId)surfaceId
{
  if (!_surfaceId) {
    _surfaceId = -1;
    for (UIView *view = self.superview; view != nil; view = view.superview) {
      if ([view isKindOfClass:RCTRootComponentView.class]) {
        _surfaceId = (SurfaceId)view.tag;
        break;
      }
    }
  }
  return *_surfaceId;
}

- (void)didMoveToSuperview
{
  [super didMoveToSuperview];
  _surfaceId.reset();
}

- (void)didMoveToWindow
{
  [super didMoveToWindow];
  _surfaceId.reset();
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXMarkerViewComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newViewProps = static_cast<const RNMBXMarkerViewProps &>(*props);
  const auto &oldViewProps =
      static_cast<const RNMBXMarkerViewProps &>(*oldProps);

    id coordinate = RNMBXConvertFollyDynamicToId(newViewProps.coordinate);
    if (coordinate != nil) {
        _view.coordinate = coordinate;
    }
    id anchor = RNMBXConvertFollyDynamicToId(newViewProps.anchor);
    if (anchor != nil) {
        _view.anchor = anchor;
    }
    RNMBX_REMAP_OPTIONAL_PROP_BOOL(allowOverlap, allowOverlap);
    RNMBX_REMAP_OPTIONAL_PROP_BOOL(allowOverlapWithPuck, allowOverlapWithPuck);
    RNMBX_REMAP_OPTIONAL_PROP_BOOL(isSelected, isSelected);

  [super updateProps:props oldProps:oldProps];
}

- (void)updateLayoutMetrics:(const LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const LayoutMetrics &)oldLayoutMetrics
{
    CGRect prev = _view.frame;
    CGRect next = RCTCGRectFromRect(layoutMetrics.frame);
    _layoutOrigin = next.origin;
    
    BOOL frameDidChange = !CGRectEqualToRect(next, prev);
    if (frameDidChange) {
      next = CGRectMake(0, 0, next.size.width, next.size.height);
    }
    
    // Copy and override `frame` rather than listing every field positionally.
    // A positional aggregate initializer silently breaks whenever React Native
    // adds, removes or reorders a `LayoutMetrics` member.
    LayoutMetrics newLayoutMetrics = layoutMetrics;
    newLayoutMetrics.frame = RCTRectFromCGRect(next);

    [super updateLayoutMetrics:newLayoutMetrics oldLayoutMetrics:oldLayoutMetrics];
    if (frameDidChange) {
        [_view updateAnnotationViewSize:next :prev];
    }
    [_view addOrUpdate];
    [self publishTranslation];
}

@end

Class<RCTComponentViewProtocol> RNMBXMarkerViewCls(void)
{
  return RNMBXMarkerViewComponentView.class;
}

