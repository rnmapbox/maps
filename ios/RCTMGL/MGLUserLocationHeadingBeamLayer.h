#import <QuartzCore/QuartzCore.h>
#import "MGLUserLocationHeadingIndicator.h"
@import Mapbox;

@interface MGLUserLocationHeadingBeamLayer : CALayer <MGLUserLocationHeadingIndicator>

- (MGLUserLocationHeadingBeamLayer *)initWithUserLocationAnnotationView:(MGLUserLocationAnnotationView *)userLocationView;
- (void)updateHeadingAccuracy:(CLLocationDirection)accuracy;
- (void)updateTintColor:(CGColorRef)color;

@end
