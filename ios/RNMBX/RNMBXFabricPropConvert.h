#pragma once

/**
 *
 * 1. Requires the following prelude
 * const auto &oldViewProps = static_cast<const RNMBXNativeUserLocationProps &>(*oldProps);
 * const auto &newViewProps = static_cast<const RNMBXNativeUserLocationProps &>(*props);
 *
 * 2. OPTION_PROPS are not set when the prop is undefined/null
 */

NSNumber* RNMBXPropConvert_Optional_BOOL_NSNumber(const folly::dynamic &dyn, NSString* propertyName);
BOOL RNMBXPropConvert_Optional_BOOL(const folly::dynamic &dyn, NSString* propertyName);
NSString* RNMBXPropConvert_Optional_NSString(const folly::dynamic &dyn, NSString* propertyName);
NSNumber* RNMBXPropConvert_Optional_NSNumber(const folly::dynamic &dyn, NSString* propertyName);
id RNMBXPropConvert_Optional_ExpressionDouble(const folly::dynamic &dyn, NSString* propertyName);
BOOL RNMBXPropConvert_BOOL(const folly::dynamic &dyn, NSString* propertyName);
NSDictionary* RNMBXPropConvert_Optional_NSDictionary(const folly::dynamic &dyn, NSString* propertyName);

#define RNMBX_OPTIONAL_PROP_BOOL_NSNumber(name) \
  if ((!oldProps.get() || oldViewProps.name != newViewProps.name) && !newViewProps.name.isNull()) { \
    _view.name = RNMBXPropConvert_Optional_BOOL_NSNumber(newViewProps.name, @#name); \
  }

#define RNMBX_REMAP_OPTIONAL_PROP_BOOL(name, viewName) \
  if ((!oldProps.get() || oldViewProps.name != newViewProps.name) && !newViewProps.name.isNull()) { \
    _view.viewName = RNMBXPropConvert_Optional_BOOL(newViewProps.name, @#name); \
  }

#define RNMBX_OPTIONAL_PROP_BOOL(name) RNMBX_REMAP_OPTIONAL_PROP_BOOL(name, name)

#define RNMBX_OPTIONAL_PROP_NSString(name) \
  if ((!oldProps.get() || oldViewProps.name != newViewProps.name) && !newViewProps.name.isNull()) { \
    _view.name = RNMBXPropConvert_Optional_NSString(newViewProps.name, @#name); \
  }

#define RNMBX_OPTIONAL_PROP_NSNumber(name) \
  if ((!oldProps.get() || oldViewProps.name != newViewProps.name) && !newViewProps.name.isNull()) { \
    _view.name = RNMBXPropConvert_Optional_NSNumber(newViewProps.name, @#name); \
  }

#define RNMBX_OPTIONAL_PROP_ExpressionDouble(name) \
  if ((!oldProps.get() || oldViewProps.name != newViewProps.name) && !newViewProps.name.isNull()) { \
    _view.name = RNMBXPropConvert_Optional_ExpressionDouble(newViewProps.name, @#name); \
  }

#define RNMBX_PROP_BOOL(name) \
  if ((!oldProps.get() || oldViewProps.name != newViewProps.name)) { \
    _view.name = RNMBXPropConvert_BOOL(newViewProps.name, @#name); \
  }

#define RNMBX_OPTIONAL_PROP_NSDictionary(name) \
  if ((!oldProps.get() || oldViewProps.name != newViewProps.name)) { \
    _view.name = RNMBXPropConvert_Optional_NSDictionary(newViewProps.name, @#name); \
  }
