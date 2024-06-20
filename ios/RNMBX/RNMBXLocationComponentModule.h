#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "rnmapbox_maps_specs.h"
#else
#import <React/RCTBridge.h>
#endif

@interface RNMBXLocationComponentModule : NSObject
#ifdef RCT_NEW_ARCH_ENABLED
<NativeRNMBXLocationModuleSpec>
#else
<RCTBridgeModule>
#endif

@end

