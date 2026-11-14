#import <CoreFoundation/CoreFoundation.h>
#import <CoreLocation/CoreLocation.h>

#import <React/RCTComponent.h>

@interface MapView : UIView
@end

#if __has_include(<rnmapbox_maps/rnmapbox_maps-Swift.h>)
#import <rnmapbox_maps/rnmapbox_maps-Swift.h>
#else
#import <rnmapbox_maps-Swift.h>
#endif
