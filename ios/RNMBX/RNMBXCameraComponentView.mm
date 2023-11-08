#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXCameraComponentView.h"
#import "RNMBXFabricHelpers.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rnmapbox_maps_specs/ComponentDescriptors.h>
#import <react/renderer/components/rnmapbox_maps_specs/EventEmitters.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <react/renderer/components/rnmapbox_maps_specs/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNMBXCameraComponentView () <RCTRNMBXCameraViewProtocol>
@end

@implementation RNMBXCameraComponentView {
    RNMBXCamera *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNMBXCameraProps>();
    _props = defaultProps;
    [self prepareView];
  }

  return self;
}

- (void)prepareView
{
    _view =  [[RNMBXCamera alloc] init];
    
    // just need to pass something, it won't really be used on fabric, but it's used to create events (it won't impact sending them)
    _view.reactTag = @-1;
    
    __weak __typeof__(self) weakSelf = self;

    [_view setOnUserTrackingModeChange:^(NSDictionary* event) {
        __typeof__(self) strongSelf = weakSelf;

        if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
            const auto [type, payload] = [RNMBXCameraComponentView stringifyEventData:event];
            std::dynamic_pointer_cast<const facebook::react::RNMBXCameraEventEmitter>(strongSelf->_eventEmitter)->onUserTrackingModeChange({type, payload});
          }
    }];
  self.contentView = _view;
}

+ (facebook::react::RNMBXCameraEventEmitter::OnUserTrackingModeChange)stringifyEventData:(NSDictionary*)event {
    std::string type = [event valueForKey:@"type"] == nil ? "" : std::string([[event valueForKey:@"type"] UTF8String]);
    NSDictionary *payload = [event valueForKey:@"payload"];
    BOOL followUserLocation = [[payload valueForKey:@"followUserLocation"] boolValue] ?: NO;
    std::string followUserMode = [[payload valueForKey:@"followUserMode"] isKindOfClass:[NSString class]] ? std::string([[payload valueForKey:@"followUserMode"] UTF8String]): "";

    return {type, {followUserLocation, followUserMode}};
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXCameraComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = static_cast<const RNMBXCameraProps &>(*props);
    id maxBounds = RNMBXConvertFollyDynamicToId(newProps.maxBounds);
    if (maxBounds != nil) {
        _view.maxBounds = maxBounds;
    }
    id animationDuration = RNMBXConvertFollyDynamicToId(newProps.animationDuration);
    if (animationDuration != nil) {
        _view.animationDuration = animationDuration;
    }
    id animationMode = RNMBXConvertFollyDynamicToId(newProps.animationMode);
    if (animationMode != nil) {
        _view.animationMode = animationMode;
    }
    id defaultStop = RNMBXConvertFollyDynamicToId(newProps.defaultStop);
    if (defaultStop != nil) {
        _view.defaultStop = defaultStop;
    }
    id followUserLocation = RNMBXConvertFollyDynamicToId(newProps.followUserLocation);
    if (followUserLocation != nil) {
        _view.followUserLocation = followUserLocation;
    }
    id followUserMode = RNMBXConvertFollyDynamicToId(newProps.followUserMode);
    if (followUserMode != nil) {
        _view.followUserMode = followUserMode;
    }
    id followZoomLevel = RNMBXConvertFollyDynamicToId(newProps.followZoomLevel);
    if (followZoomLevel != nil) {
        _view.followZoomLevel = followZoomLevel;
    }
    id followPitch = RNMBXConvertFollyDynamicToId(newProps.followPitch);
    if (followPitch != nil) {
        _view.followPitch = followPitch;
    }
    id followHeading = RNMBXConvertFollyDynamicToId(newProps.followHeading);
    if (followHeading != nil) {
        _view.followHeading = followHeading;
    }
    id followPadding = RNMBXConvertFollyDynamicToId(newProps.followPadding);
    if (followPadding != nil) {
        _view.followPadding = followPadding;
    }
    id maxZoomLevel = RNMBXConvertFollyDynamicToId(newProps.maxZoomLevel);
    if (maxZoomLevel != nil) {
        _view.maxZoomLevel = maxZoomLevel;
    }
    id minZoomLevel = RNMBXConvertFollyDynamicToId(newProps.minZoomLevel);
    if (minZoomLevel != nil) {
        _view.minZoomLevel = minZoomLevel;
    }
    id stop = RNMBXConvertFollyDynamicToId(newProps.stop);
    if (stop != nil) {
        _view.stop = stop;
    }
  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle
{
    [super prepareForRecycle];
    [self prepareView];
}

@end

Class<RCTComponentViewProtocol> RNMBXCameraCls(void)
{
  return RNMBXCameraComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
