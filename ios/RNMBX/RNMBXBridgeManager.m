#import "RNMBXBridgeManager.h"
#import <React/RCTBridge+Private.h>

static __weak RCTBridge *_rnmbxBridge = nil;

@implementation RNMBXBridgeManager

+ (void)setBridge:(RCTBridge *)bridge {
    _rnmbxBridge = bridge;
}

+ (RCTBridge *)currentBridge {
    return [RCTBridge currentBridge] ?: _rnmbxBridge;
}

@end
