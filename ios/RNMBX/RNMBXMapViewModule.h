#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "RNMBXViewResolver.h"

#ifdef __cplusplus
#import "rnmapbox_maps_specs.h"

@interface RNMBXMapViewModule : NSObject <NativeMapViewModuleSpec, RNMBXViewResolverDelegate>
@end

#else

@interface RNMBXMapViewModule : NSObject
@end

#endif
