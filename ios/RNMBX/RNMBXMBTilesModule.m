#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNMBXMBTiles, NSObject)

RCT_EXTERN_METHOD(initMBTilesSource:(NSString *)filePath
                 sourceId:(NSString *)sourceId
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(initMBTilesSourceFromAsset:(NSString *)assetName
                 sourceId:(NSString *)sourceId
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getMBTilesURL:(NSString *)sourceId
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(removeMBTilesSource:(NSString *)sourceId
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isMBTilesSourceActive:(NSString *)sourceId
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getActiveMBTilesSources:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

@end