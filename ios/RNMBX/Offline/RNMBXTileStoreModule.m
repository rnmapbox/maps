#import "React/RCTBridgeModule.h"
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNMBXTileStoreModule, NSObject)

RCT_EXTERN_METHOD(shared:(NSString *) path resolver:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject)
RCT_EXTERN_METHOD(setOption:(nonnull NSNumber *) tag key:(NSString*) key domain:(NSString*) domain value:(NSDictionary*) value resolver:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject)

@end
