#ifdef RCT_NEW_ARCH_ENABLED

#import "RNMBXCameraComponentView.h"

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
      _view =  [[RNMBXCamera alloc] init];
      
      // just need to pass something, it won't really be used on fabric, but it's used to create events (it won't impact sending them)
      _view.reactTag = @-1;
      
      __weak __typeof__(self) weakSelf = self;

      [_view setOnUserTrackingModeChange:^(NSDictionary* event) {
          __typeof__(self) strongSelf = weakSelf;

          if (strongSelf != nullptr && strongSelf->_eventEmitter != nullptr) {
              const auto [type, json] = [RNMBXCameraComponentView stringifyEventData:event];
              std::dynamic_pointer_cast<const facebook::react::RNMBXCameraEventEmitter>(strongSelf->_eventEmitter)->onUserTrackingModeChange({type, json});
            }
      }];
    self.contentView = _view;
  }

  return self;
}

+ (std::tuple<BOOL, std::string>)stringifyEventData:(NSDictionary*)event {
    BOOL followUserLocation = [[event valueForKey:@"followUserLocation"] boolValue] == YES ? YES : NO;
    std::string followUserMode = [event valueForKey:@"followUserMode"] == nil ? "" : std::string([[event valueForKey:@"followUserMode"] UTF8String]);

    return {followUserLocation, followUserMode};
}

+ (NSDictionary *)convertDefaultStopToDictionary:(RNMBXCameraDefaultStopStruct)stop {
    NSMutableDictionary *result = [NSMutableDictionary new];
    result[@"centerCoordinate"] = RCTNSStringFromStringNilIfEmpty(stop.centerCoordinate);
    result[@"bounds"] = RCTNSStringFromStringNilIfEmpty(stop.bounds);
    result[@"heading"] = @(stop.heading);
    result[@"pitch"] = @(stop.pitch);
    result[@"zoom"] = @(stop.zoom);
    result[@"paddingLeft"] = @(stop.paddingLeft);
    result[@"paddingRight"] = @(stop.paddingRight);
    result[@"paddingTop"] = @(stop.paddingTop);
    result[@"paddingBottom"] = @(stop.paddingBottom);
    result[@"duration"] = @(stop.duration);
    result[@"mode"] = RCTNSStringFromStringNilIfEmpty(stop.mode);

    
    return result;
}

+ (NSDictionary *)convertStopToDictionary:(RNMBXCameraStopStruct)stop {
    NSMutableDictionary *result = [NSMutableDictionary new];
    result[@"centerCoordinate"] = RCTNSStringFromStringNilIfEmpty(stop.centerCoordinate);
    result[@"bounds"] = RCTNSStringFromStringNilIfEmpty(stop.bounds);
    result[@"heading"] = @(stop.heading);
    result[@"pitch"] = @(stop.pitch);
    result[@"zoom"] = @(stop.zoom);
    result[@"paddingLeft"] = @(stop.paddingLeft);
    result[@"paddingRight"] = @(stop.paddingRight);
    result[@"paddingTop"] = @(stop.paddingTop);
    result[@"paddingBottom"] = @(stop.paddingBottom);
    result[@"duration"] = @(stop.duration);
    result[@"mode"] = RCTNSStringFromStringNilIfEmpty(stop.mode);

    
    return result;
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

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNMBXCameraComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const RNMBXCameraProps>(props);
    _view.maxBounds = RCTNSStringFromStringNilIfEmpty(newProps.maxBounds);
    _view.animationDuration = @(newProps.animationDuration);
    _view.animationMode = RCTNSStringFromStringNilIfEmpty(newProps.animationMode);
    _view.defaultStop = [RNMBXCameraComponentView convertDefaultStopToDictionary:newProps.defaultStop];

    _view.followUserLocation = @(newProps.followUserLocation);
    _view.followUserMode = RCTNSStringFromStringNilIfEmpty(newProps.followUserMode);
    _view.followZoomLevel = @(newProps.followZoomLevel);
    _view.followPitch = @(newProps.followPitch);
    _view.followHeading = @(newProps.followHeading);
    _view.followPadding = [RNMBXCameraComponentView convertDynamicToDictionary:&newProps.followPadding];

    _view.maxZoomLevel = @(newProps.maxZoomLevel);
    _view.minZoomLevel = @(newProps.minZoomLevel);
    _view.stop = [RNMBXCameraComponentView convertStopToDictionary:newProps.stop];
    
  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> RNMBXCameraCls(void)
{
  return RNMBXCameraComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
