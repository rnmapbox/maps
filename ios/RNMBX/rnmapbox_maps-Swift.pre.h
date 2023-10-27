#import <CoreFoundation/CoreFoundation.h>
#import <CoreLocation/CoreLocation.h>

@interface MapView : UIView
@end

#if RNMBX_USE_FRAMEWORKS
#import <rnmapbox_maps/rnmapbox_maps-Swift.h>
#else
#import <rnmapbox_maps-Swift.h>
#endif
