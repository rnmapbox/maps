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
