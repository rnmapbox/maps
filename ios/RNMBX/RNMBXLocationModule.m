#import "React/RCTBridgeModule.h"
#import <React/RCTEventEmitter.h>

@class RNMBXLocation;

@interface RCT_EXTERN_MODULE(RNMBXLocationModule, RCTEventEmitter)

RCT_EXTERN_METHOD(start:(CLLocationDistance)minDisplacement)
RCT_EXTERN_METHOD(stop)
RCT_EXTERN_METHOD(getLastKnownLocation)

RCT_EXTERN_METHOD(setMinDisplacement:(CLLocationDistance)minDisplacement)
RCT_EXTERN_METHOD(setRequestsAlwaysUse:(BOOL)requestsAlwaysUse)

RCT_EXTERN_METHOD(setLocationEventThrottle:(nonnull NSNumber *)throttleValue)

RCT_EXTERN_METHOD(simulateHeading:(nonnull NSNumber*)changesPerSecond increment:(nonnull NSNumber*))


@end
