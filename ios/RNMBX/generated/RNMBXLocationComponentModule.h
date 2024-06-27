/***
to: ios/RNMBX/generated/RNMBXLocationComponentModule.h
***/
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "rnmapbox_maps_specs.h"
#else
#import <React/RCTBridge.h>
#endif

@interface RNMBXLocationComponentModule : NSObject
#ifdef RCT_NEW_ARCH_ENABLED
<NativeRNMBXLocationComponentModuleSpec>
#else
<RCTBridgeModule>
#endif

@end

