#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "RNMBXViewResolver.h"

#ifdef __cplusplus
#import "rnmapbox_maps_specs.h"

@interface RNMBXPointAnnotationModule : NSObject <NativeRNMBXPointAnnotationModuleSpec, RNMBXViewResolverDelegate>
@end

#else

@interface RNMBXPointAnnotationModule : NSObject
@end

#endif
