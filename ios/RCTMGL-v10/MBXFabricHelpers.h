#import <React/RCTConversions.h>
#import <folly/dynamic.h>
#import <react/renderer/components/rnmapbox_maps_specs/Props.h>

// copied from RCTFollyConvert
static id RNMBXConvertFollyDynamicToId(const folly::dynamic &dyn)
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

static NSArray<NSString *> *RNMBXConvertArrayOfString(std::vector<std::string> stringArray)
{
    NSMutableArray<NSString *> *result = [NSMutableArray new];
    for (auto string : stringArray) {
        [result addObject:RCTNSStringFromStringNilIfEmpty(string)];
    }
    return result;
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

static NSDictionary *RNMBXConvertDynamicToDictionary(const folly::dynamic* dynamic) {
    NSMutableDictionary<NSString*, NSNumber*>* result = [[NSMutableDictionary alloc] init];

    if (!dynamic->isNull()) {
        for (auto& pair : dynamic->items()) {
            NSString* key = [NSString stringWithUTF8String:pair.first.getString().c_str()];
            id obj = RNMBXConvertFollyDynamicToId(pair.second);
            [result setValue:obj forKey:key];
        }
    }

    return result;
}

static NSMutableArray *RNMBXConvertDynamicArrayToArray(const std::vector<folly::dynamic>* dynamicArray) {
    NSMutableArray* result = [[NSMutableArray alloc] init];

    for (auto dynamic: *dynamicArray) {
        [result addObject:RNMBXConvertFollyDynamicToId(dynamic)];
    }
    return result;
}

static NSDictionary *RNMBXConvertLocalizeLabels(const facebook::react::MBXMapViewLocalizeLabelsStruct* labels) {
    NSMutableDictionary* result = [[NSMutableDictionary alloc] init];
    NSMutableArray* ids = [[NSMutableArray alloc] init];

    [result setValue:[NSString stringWithUTF8String:labels->locale.c_str()] forKey:@"locale"];

    for (auto& layerId : labels->layerIds) {
        NSString* value = [NSString stringWithUTF8String:layerId.c_str()];
        [ids addObject:value];
    }

    [result setValue:ids forKey:@"layerIds"];

    return result;
}
