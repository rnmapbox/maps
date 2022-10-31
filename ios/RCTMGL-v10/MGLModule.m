#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(MGLModule, NSObject)

RCT_EXTERN_METHOD(setAccessToken:(NSString *)accessToken resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(addCustomHeader:(NSString *)headerName forHeaderValue:(NSString *) headerValue)
RCT_EXTERN_METHOD(removeCustomHeader:(NSString *)headerName)

RCT_EXTERN_METHOD(setTelemetryEnabled:(BOOL)telemetryEnabled)
RCT_EXTERN_METHOD(setWellKnownTileServer:(NSString *)tileServer)


@end
