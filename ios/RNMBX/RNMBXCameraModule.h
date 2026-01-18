#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "RNMBXViewResolver.h"

#ifdef __cplusplus
#import "rnmapbox_maps_specs.h"

@interface RNMBXCameraModule : NSObject <NativeRNMBXCameraModuleSpec, RNMBXViewResolverDelegate>
@end

#else

@interface RNMBXCameraModule : NSObject
@end

#endif
