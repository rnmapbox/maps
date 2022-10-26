#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(MGLModule, NSObject)

RCT_EXTERN_METHOD(setAccessToken:)

RCT_EXTERN_METHOD(addCustomHeader:(NSString *)headerName forHeaderValue:(NSString *) headerValue)
RCT_EXTERN_METHOD(removeCustomHeader:(NSString *)headerName)

RCT_EXTERN_METHOD(setTelemetryEnabled:(BOOL)telemetryEnabled )

@end
