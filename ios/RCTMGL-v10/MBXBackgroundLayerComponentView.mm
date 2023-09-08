#ifdef RCT_NEW_ARCH_ENABLED

#import "MBXBackgroundLayerComponentView.h"

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

@interface MBXBackgroundLayerComponentView () <RCTMBXBackgroundLayerViewProtocol>
@end

@implementation MBXBackgroundLayerComponentView {
    MBXBackgroundLayer *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MBXBackgroundLayerProps>();
    _props = defaultProps;
    _view = [[MBXBackgroundLayer alloc] init];
      
    self.contentView = _view;
  }

  return self;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MBXBackgroundLayerComponentDescriptor>();
}

// copied from RCTFollyConvert
+ (id)convertFollyDynamicToId:(const folly::dynamic)dyn
{
  // I could imagine an implementation which avoids copies by wrapping the
  // dynamic in a derived class of NSDictionary.  We can do that if profiling
  // implies it will help.

  switch (dyn.type()) {
    case folly::dynamic::NULLT:
      return (id)kCFNull;
    case folly::dynamic::BOOL:
      return dyn.getBool() ? @YES : @NO;
    case folly::dynamic::INT64:
      return @(dyn.getInt());
    case folly::dynamic::DOUBLE:
      return @(dyn.getDouble());
    case folly::dynamic::STRING:
      return [[NSString alloc] initWithBytes:dyn.c_str() length:dyn.size() encoding:NSUTF8StringEncoding];
    case folly::dynamic::ARRAY: {
      NSMutableArray *array = [[NSMutableArray alloc] initWithCapacity:dyn.size()];
      for (const auto &elem : dyn) {
        id value = [self convertFollyDynamicToId:elem];
        if (value) {
          [array addObject:value];
        }
      }
      return array;
    }
    case folly::dynamic::OBJECT: {
      NSMutableDictionary *dict = [[NSMutableDictionary alloc] initWithCapacity:dyn.size()];
      for (const auto &elem : dyn.items()) {
          id key = [self convertFollyDynamicToId:elem.first];
          id value = [self convertFollyDynamicToId:elem.second];
        if (key && value) {
          dict[key] = value;
        }
      }
      return dict;
    }
  }
}

+ (NSMutableArray*)convertDynamicArrayToArray:(const std::vector<folly::dynamic>*)dynamicArray {
    NSMutableArray* result = [[NSMutableArray alloc] init];

    for (auto dynamic: *dynamicArray) {
        [result addObject:[self convertFollyDynamicToId:dynamic]];
    }
    return result;
}

+ (NSDictionary*)convertDynamicToDictionary:(const folly::dynamic*)dynamic {
    NSMutableDictionary* result = [[NSMutableDictionary alloc] init];

    if (!dynamic->isNull()) {
        for (auto& pair : dynamic->items()) {
            NSString* key = [NSString stringWithUTF8String:pair.first.getString().c_str()];
            id obj = [self convertFollyDynamicToId:pair.second];
            [result setValue:obj forKey:key];
        }
    }

    return result;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const MBXBackgroundLayerProps>(props);
    _view.id = RCTNSStringFromStringNilIfEmpty(newProps.id);
    _view.sourceID = RCTNSStringFromStringNilIfEmpty(newProps.sourceID);
    _view.filter = [MBXBackgroundLayerComponentView convertDynamicArrayToArray:&newProps.filter];
    _view.aboveLayerID = RCTNSStringFromStringNilIfEmpty(newProps.aboveLayerID);
    _view.belowLayerID = RCTNSStringFromStringNilIfEmpty(newProps.belowLayerID);
    _view.layerIndex = @(newProps.layerIndex);
    _view.reactStyle = [MBXBackgroundLayerComponentView convertDynamicToDictionary:&newProps.reactStyle];
    _view.maxZoomLevel = @(newProps.maxZoomLevel);
    _view.minZoomLevel = @(newProps.minZoomLevel);

  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> MBXBackgroundLayerCls(void)
{
  return MBXBackgroundLayerComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
