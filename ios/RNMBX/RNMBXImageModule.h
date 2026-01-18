#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "RNMBXViewResolver.h"

#ifdef __cplusplus
#import "rnmapbox_maps_specs.h"

@interface RNMBXImageModule : NSObject <NativeRNMBXImageModuleSpec, RNMBXViewResolverDelegate>
@end

#else

@interface RNMBXImageModule : NSObject
@end

#endif
