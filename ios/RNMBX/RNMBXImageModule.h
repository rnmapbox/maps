#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "rnmapbox_maps_specs.h"
#else
#import <React/RCTBridge.h>
#endif

@interface RNMBXImageModule : NSObject
#ifdef RCT_NEW_ARCH_ENABLED
<NativeRNMBXImageModuleSpec>
#else
<RCTBridgeModule>
#endif

@end
