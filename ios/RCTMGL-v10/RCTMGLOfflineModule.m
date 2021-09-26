#import "React/RCTBridgeModule.h"
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RCTMGLOfflineModule, RCTEventEmitter<RCTBridgeModule>)

RCT_EXTERN_METHOD(getPacks:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(createPack:(NSDictionary *) options resolver: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
