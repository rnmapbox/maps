#ifdef RCT_NEW_ARCH_ENABLED

#if __has_include(<react/utils/FollyConvert.h>)
  // static libs / header maps (no use_frameworks!)
  #import <react/utils/FollyConvert.h>
#elif __has_include("FollyConvert.h")
  /// `use_frameworks! :linkage => :static` users will need to import FollyConvert this way
  #import "FollyConvert.h"
#elif __has_include("RCTFollyConvert.h")
  #import "RCTFollyConvert.h"
#else
  #error "FollyConvert.h not found. Ensure React-utils & RCT-Folly pods are installed."
#endif

#endif