#import "RCTMGLNativeUserLocationManager.h"
#import "RCTMGLNativeUserLocation.h"

@implementation RCTMGLNativeUserLocationManager

RCT_EXPORT_MODULE(RCTMGLNativeUserLocation)

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
