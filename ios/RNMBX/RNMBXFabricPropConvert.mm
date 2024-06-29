#ifdef RCT_NEW_ARCH_ENABLED

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>
#import <React/RCTBridge+Private.h>

#import "rnmapbox_maps-Swift.pre.h"
#import "RNMBXFabricPropConvert.h"

BOOL RNMBXPropConvert_BOOL(const folly::dynamic &dyn, NSString* propertyName) {
  switch (dyn.type()) {
    case folly::dynamic::BOOL:
      return dyn.getBool();
    default:
      std::stringstream ss;
      ss << dyn;
      [RNMBXLogger error:[NSString stringWithFormat:@"Property %@ expected to be a boolean but was: $d",
                          propertyName,
                          ss.str().c_str()
                         ]];
      return NULL;
  }
}

NSNumber* RNMBXPropConvert_Optional_BOOL_NSNumber(const folly::dynamic &dyn, NSString* propertyName) {
  switch (dyn.type()) {
    case folly::dynamic::NULLT:
      return NULL;
    case folly::dynamic::BOOL:
      return [NSNumber numberWithBool:dyn.getBool()];
    default:
      std::stringstream ss;
      ss << dyn;
      [RNMBXLogger error:[NSString stringWithFormat:@"Property %@ expected to be a boolean or nil but was: $d",
                          propertyName,
                          ss.str().c_str()
                         ]];
      return NULL;
  }
}

BOOL RNMBXPropConvert_Optional_BOOL(const folly::dynamic &dyn, NSString* propertyName) {
  switch (dyn.type()) {
    case folly::dynamic::BOOL:
      return dyn.getBool();
    default:
      std::stringstream ss;
      ss << dyn;
      [RNMBXLogger error:[NSString stringWithFormat:@"Property %@ expected to be a boolean or nil but was: $d",
                          propertyName,
                          ss.str().c_str()
                         ]];
      return NO;
  }
}

NSString* RNMBXPropConvert_Optional_NSString(const folly::dynamic &dyn, NSString* propertyName) {
  switch (dyn.type()) {
    case folly::dynamic::STRING:
      return [NSString stringWithCString:dyn.getString().c_str() encoding:NSUTF8StringEncoding];
    case folly::dynamic::NULLT:
      return nil;
    default:
      std::stringstream ss;
      ss << dyn;
      [RNMBXLogger error:[NSString stringWithFormat:@"Property %@ expected to be a string or nil but was: %s",
                          propertyName,
                          ss.str().c_str()
                         ]];
      return nil;
  }
}

NSNumber* RNMBXPropConvert_Optional_NSNumber(const folly::dynamic &dyn, NSString* propertyName) {
  switch (dyn.type()) {
    case folly::dynamic::INT64:
      return @(dyn.getInt());
    case folly::dynamic::DOUBLE:
      return @(dyn.getDouble());
    case folly::dynamic::NULLT:
      return nil;
    default:
      std::stringstream ss;
      ss << dyn;
      [RNMBXLogger error:[NSString stringWithFormat:@"Property %@ expected to be a number or nil but was: %s",
                          propertyName,
                          ss.str().c_str()
                         ]];
      return nil;
  }
}



id RNMBXPropConvert_ID(const folly::dynamic &dyn)
{
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
      return [NSString stringWithCString:dyn.c_str() encoding:NSUTF8StringEncoding];
    case folly::dynamic::ARRAY: {
      NSMutableArray *array = [[NSMutableArray alloc] initWithCapacity:dyn.size()];
      for (const auto &elem : dyn) {
        id value = RNMBXPropConvert_ID(elem);
        if (value) {
          [array addObject:value];
        }
      }
      return array;
    }
    case folly::dynamic::OBJECT: {
      NSMutableDictionary *dict = [[NSMutableDictionary alloc] initWithCapacity:dyn.size()];
      for (const auto &elem : dyn.items()) {
        id key = RNMBXPropConvert_ID(elem.first);
        id value = RNMBXPropConvert_ID(elem.second);
        if (key && value) {
          dict[key] = value;
        }
      }
      return dict;
    }
  }
}

id RNMBXPropConvert_Optional_ExpressionDouble(const folly::dynamic &dyn, NSString* propertyName) {
  switch (dyn.type()) {
  case folly::dynamic::ARRAY:
    return RNMBXPropConvert_ID(dyn);
  case folly::dynamic::DOUBLE:
    return [NSNumber numberWithDouble:dyn.getDouble()];
  case folly::dynamic::INT64:
    return [NSNumber numberWithInt:dyn.getInt()];
  default:
    std::stringstream ss;
    ss << dyn;
    [RNMBXLogger error:[NSString stringWithFormat:@"Property %@ expected to be an array or a number: %s",
                        propertyName,
                        ss.str().c_str()
                       ]];
    return nil;
  }
}

NSDictionary* RNMBXPropConvert_Optional_NSDictionary(const folly::dynamic &dyn, NSString* propertyName)
{
  return RNMBXPropConvert_ID(dyn);
}

#endif
