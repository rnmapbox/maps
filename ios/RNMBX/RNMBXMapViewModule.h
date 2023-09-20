#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "rnmapbox_maps_specs.h"
#else
#import <React/RCTBridge.h>
#endif

@interface RNMBXMapViewModule : NSObject
#ifdef RCT_NEW_ARCH_ENABLED
<NativeMapViewModuleSpec>
#else
<RCTBridgeModule>
#endif

@end

