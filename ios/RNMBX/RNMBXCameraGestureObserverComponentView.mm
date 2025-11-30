#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXCameraGestureObserverComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>
#import <React/RCTBridge+Private.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

#import "RNMBXFabricPropConvert.h"

using namespace facebook::react;

@interface RNMBXCameraGestureObserverComponentView () <RCTRNMBXCameraGestureObserverViewProtocol>
@end

@implementation RNMBXCameraGestureObserverComponentView {
    RNMBXCameraGestureObserver *_view;
}

+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXCameraGestureObserverProps>();
    _props = defaultProps;
    [self prepareView];
  }

  return self;
}

- (void)prepareView
{
  _view = [[RNMBXCameraGestureObserver alloc] init];
  self.contentView = _view;
}

- (void)setHasOnMapSteady:(BOOL)hasOnMapSteady {
  if (hasOnMapSteady) {
    #if DEBUG
    NSLog(@"[RNMBXCameraGestureObserver] setHasOnMapSteady=YES");
    #endif
    __weak __typeof__(self) weakSelf = self;
    [_view setOnMapSteady:^(NSString* reason, NSNumber* _Nullable idleDurationMs, NSString* _Nullable lastGestureType, NSNumber* timestamp){
      __typeof__(self) strongSelf = weakSelf;
      if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
        using EventEmitterT = facebook::react::RNMBXCameraGestureObserverEventEmitter;
        EventEmitterT::OnMapSteadyReason reasonEnum = EventEmitterT::OnMapSteadyReason::Steady;
        if ([reason isEqualToString:@"timeout"]) {
          reasonEnum = EventEmitterT::OnMapSteadyReason::Timeout;
        } else {
          reasonEnum = EventEmitterT::OnMapSteadyReason::Steady;
        }

        double ts = [timestamp doubleValue];
        double idle = idleDurationMs != nil ? [idleDurationMs doubleValue] : 0.0;
        std::string lastGesture = lastGestureType != nil ? std::string([lastGestureType UTF8String]) : std::string("");
        #if DEBUG
        NSLog(@"[RNMBXCameraGestureObserver] emitting onMapSteady reason=%s idle=%.2f lastGesture=%s ts=%.0f",
              EventEmitterT::toString(reasonEnum), idle, lastGesture.c_str(), ts);
        #endif
        std::dynamic_pointer_cast<const EventEmitterT>(strongSelf->_eventEmitter)->onMapSteady({reasonEnum, idle, lastGesture, ts});
      }
    }];
  } else {
    #if DEBUG
    NSLog(@"[RNMBXCameraGestureObserver] setHasOnMapSteady=NO");
    #endif
    [_view setHasOnMapSteady:NO];
  }
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXCameraGestureObserverComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldViewProps = static_cast<const RNMBXCameraGestureObserverProps &>(*oldProps);
  const auto &newViewProps = static_cast<const RNMBXCameraGestureObserverProps &>(*props);

  RNMBX_OPTIONAL_PROP_NSNumber(quietPeriodMs);
  RNMBX_OPTIONAL_PROP_NSNumber(maxIntervalMs);
  RNMBX_OPTIONAL_PROP_BOOL(hasOnMapSteady);

  if (!oldProps.get() || oldViewProps.hasOnMapSteady != newViewProps.hasOnMapSteady) {
    [self setHasOnMapSteady:newViewProps.hasOnMapSteady.asBool()];
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  [self prepareView];
}

@end

Class<RCTComponentViewProtocol> RNMBXCameraGestureObserverCls(void)
{
  return RNMBXCameraGestureObserverComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
