#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "RNMBXViewResolver.h"

#ifdef __cplusplus
#import "rnmapbox_maps_specs.h"

@interface RNMBXShapeSourceModule : NSObject <NativeRNMBXShapeSourceModuleSpec, RNMBXViewResolverDelegate>
@end

#else

@interface RNMBXShapeSourceModule : NSObject
@end

#endif
