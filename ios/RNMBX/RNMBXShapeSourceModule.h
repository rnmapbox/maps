#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "RNMBXViewResolver.h"

#ifdef RCT_NEW_ARCH_ENABLED
#import "rnmapbox_maps_specs.h"
#else
#import <React/RCTBridge.h>
#endif

@interface RNMBXShapeSourceModule : NSObject
#ifdef RCT_NEW_ARCH_ENABLED
<NativeRNMBXShapeSourceModuleSpec, RNMBXViewResolverDelegate>
#else
<RCTBridgeModule, RNMBXViewResolverDelegate>
#endif

@end

