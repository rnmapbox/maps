#import <React/RCTBridgeModule.h>


@interface RCT_EXTERN_MODULE(RNMBXSnapshotModule, NSObject<RCTBridgeModule>)

RCT_EXTERN_METHOD(takeSnap:(NSDictionary *)jsOptions
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
