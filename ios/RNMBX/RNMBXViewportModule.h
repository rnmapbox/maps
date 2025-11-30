#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "RNMBXViewResolver.h"

#ifdef RCT_NEW_ARCH_ENABLED
#import "rnmapbox_maps_specs.h"
#else
#import <React/RCTBridge.h>
#endif

@interface RNMBXViewportModule : NSObject
#ifdef RCT_NEW_ARCH_ENABLED
<NativeRNMBXViewportModuleSpec, RNMBXViewResolverDelegate>
#else
<RCTBridgeModule, RNMBXViewResolverDelegate>
#endif

@end

