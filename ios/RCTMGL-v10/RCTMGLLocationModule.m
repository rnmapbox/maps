#import "React/RCTBridgeModule.h"
#import <React/RCTEventEmitter.h>

@class RCTMGLLocation;

@interface RCT_EXTERN_MODULE(RCTMGLLocationModule, RCTEventEmitter)

RCT_EXTERN_METHOD(start:(CLLocationDistance)minDisplacement)
RCT_EXTERN_METHOD(stop)
RCT_EXTERN_METHOD(getLastKnownLocation)

RCT_EXTERN_METHOD(setMinDisplacement:(CLLocationDistance)minDisplacement)


@end
