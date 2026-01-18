#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "RNMBXViewResolver.h"

#ifdef __cplusplus
#import "rnmapbox_maps_specs.h"

@interface RNMBXViewportModule : NSObject <NativeRNMBXViewportModuleSpec, RNMBXViewResolverDelegate>
@end

#else

@interface RNMBXViewportModule : NSObject
@end

#endif
