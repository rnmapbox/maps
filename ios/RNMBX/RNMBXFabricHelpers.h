#import <React/RCTConversions.h>
#import <folly/dynamic.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>
#import <objc/runtime.h>

#import "rnmapbox_maps-Swift.pre.h"

// copied from RCTFollyConvert
static id RNMBXConvertFollyDynamicToId(const folly::dynamic &dyn)
{
  // I could imagine an implementation which avoids copies by wrapping the
  // dynamic in a derived class of NSDictionary.  We can do that if profiling
  // implies it will help.

  switch (dyn.type()) {
    case folly::dynamic::NULLT:
      return nil;
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
        id value = RNMBXConvertFollyDynamicToId(elem);
        if (value) {
          [array addObject:value];
        }
      }
      return array;
    }
    case folly::dynamic::OBJECT: {
      NSMutableDictionary *dict = [[NSMutableDictionary alloc] initWithCapacity:dyn.size()];
      for (const auto &elem : dyn.items()) {
        id key = RNMBXConvertFollyDynamicToId(elem.first);
        id value = RNMBXConvertFollyDynamicToId(elem.second);
        if (key && value) {
          dict[key] = value;
        }
      }
      return dict;
    }
  }
}

// copied from RCTFollyConvert
static folly::dynamic RNMBXConvertIdToFollyDynamic(id json)
{
  if (json == nil || json == (id)kCFNull) {
    return nullptr;
  } else if ([json isKindOfClass:[NSNumber class]]) {
    const char *objCType = [json objCType];
    switch (objCType[0]) {
      // This is a c++ bool or C99 _Bool.  On some platforms, BOOL is a bool.
      case _C_BOOL:
        return (bool)[json boolValue];
      case _C_CHR:
        // On some platforms, objc BOOL is a signed char, but it
        // might also be a small number.  Use the same hack JSC uses
        // to distinguish them:
        // https://phabricator.intern.facebook.com/diffusion/FBS/browse/master/fbobjc/xplat/third-party/jsc/safari-600-1-4-17/JavaScriptCore/API/JSValue.mm;b8ee03916489f8b12143cd5c0bca546da5014fc9$901
        if ([json isKindOfClass:[@YES class]]) {
          return (bool)[json boolValue];
        } else {
          return [json longLongValue];
        }
      case _C_UCHR:
      case _C_SHT:
      case _C_USHT:
      case _C_INT:
      case _C_UINT:
      case _C_LNG:
      case _C_ULNG:
      case _C_LNG_LNG:
      case _C_ULNG_LNG:
        return [json longLongValue];

      case _C_FLT:
      case _C_DBL:
        return [json doubleValue];

        // default:
        //   fall through
    }
  } else if ([json isKindOfClass:[NSString class]]) {
    NSData *data = [json dataUsingEncoding:NSUTF8StringEncoding];
    return std::string(reinterpret_cast<const char *>(data.bytes), data.length);
  } else if ([json isKindOfClass:[NSArray class]]) {
    folly::dynamic array = folly::dynamic::array;
    for (id element in json) {
      array.push_back(RNMBXConvertIdToFollyDynamic(element));
    }
    return array;
  } else if ([json isKindOfClass:[NSDictionary class]]) {
    __block folly::dynamic object = folly::dynamic::object();

    [json enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSString *value, __unused BOOL *stop) {
      object.insert(RNMBXConvertIdToFollyDynamic(key), RNMBXConvertIdToFollyDynamic(value));
    }];

    return object;
  }

  return nil;
}


static std::tuple<std::string, std::string> RNMBXStringifyEventData(NSDictionary* event) {
    std::string type = [event valueForKey:@"type"] == nil ? "" : std::string([[event valueForKey:@"type"] UTF8String]);
    std::string json = "{}";

    NSError *error;
    NSData *jsonData = nil;

    if ([event valueForKey:@"payload"] != nil) {
        jsonData = [NSJSONSerialization dataWithJSONObject:[event valueForKey:@"payload"]
                                                           options:0
                                                             error:&error];
    }

    if (jsonData) {
        json = std::string([[[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding] UTF8String]);
    }

    return {type, json};
}

template <typename T>
void RNMBXSetCommonLayerPropsWithoutSourceID(const T& newProps, RNMBXLayer *_view)
{
    id idx = RNMBXConvertFollyDynamicToId(newProps.id);
    if (idx != nil) {
        _view.id = idx;
    }
    id sourceID = RNMBXConvertFollyDynamicToId(newProps.sourceID);
    if (sourceID != nil) {
        _view.sourceID = sourceID;
    }
    id filter = RNMBXConvertFollyDynamicToId(newProps.filter);
    if (filter != nil) {
        _view.filter = filter;
    }
    id aboveLayerID = RNMBXConvertFollyDynamicToId(newProps.aboveLayerID);
    if (aboveLayerID != nil) {
        _view.aboveLayerID = aboveLayerID;
    }
    id belowLayerID = RNMBXConvertFollyDynamicToId(newProps.belowLayerID);
    if (belowLayerID != nil) {
        _view.belowLayerID = belowLayerID;
    }
    id layerIndex = RNMBXConvertFollyDynamicToId(newProps.layerIndex);
    if (layerIndex != nil) {
        _view.layerIndex = layerIndex;
    }
    id reactStyle = RNMBXConvertFollyDynamicToId(newProps.reactStyle);
    if (reactStyle != nil) {
        _view.reactStyle = reactStyle;
    }
    id maxZoomLevel = RNMBXConvertFollyDynamicToId(newProps.maxZoomLevel);
    if (maxZoomLevel != nil) {
        _view.maxZoomLevel = maxZoomLevel;
    }
    id minZoomLevel = RNMBXConvertFollyDynamicToId(newProps.minZoomLevel);
    if (minZoomLevel != nil) {
        _view.minZoomLevel = minZoomLevel;
    }
}

template <typename T>
void RNMBXSetCommonLayerProps(const T& newProps, RNMBXLayer *_view)
{
    RNMBXSetCommonLayerPropsWithoutSourceID(newProps, _view);
    id sourceLayerID = RNMBXConvertFollyDynamicToId(newProps.sourceLayerID);
    if (sourceLayerID != nil) {
        _view.sourceLayerID = sourceLayerID;
    }
}

