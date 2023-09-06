#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNDummyShapeAnimatorModule, NSObject<RCTBridgeModule>)

RCT_EXTERN_METHOD(create:(nonnull NSNumber*) tag
                  startLocation:(NSDictionary *)startLocation
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(start:(nonnull NSNumber*) tag)

@end
