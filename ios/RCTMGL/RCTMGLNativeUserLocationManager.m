#import "RCTMGLNativeUserLocationManager.h"
#import "RCTMGLNativeUserLocation.h"

@implementation RCTMGLNativeUserLocationManager

RCT_EXPORT_MODULE(RCTMGLNativeUserLocation)
RCT_EXPORT_VIEW_PROPERTY(iosShowsUserHeadingIndicator, BOOL)


#pragma - View Properties


#pragma Methods

- (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (UIView *)view
{
    return [[RCTMGLNativeUserLocation alloc] init];
}

@end
