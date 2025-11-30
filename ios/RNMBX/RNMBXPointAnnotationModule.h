#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "RNMBXViewResolver.h"

#ifdef RCT_NEW_ARCH_ENABLED
#import "rnmapbox_maps_specs.h"
#else
#import <React/RCTBridge.h>
#endif

@interface RNMBXPointAnnotationModule : NSObject
#ifdef RCT_NEW_ARCH_ENABLED
<NativeRNMBXPointAnnotationModuleSpec, RNMBXViewResolverDelegate>
#else
<RCTBridgeModule, RNMBXViewResolverDelegate>
#endif

@end
