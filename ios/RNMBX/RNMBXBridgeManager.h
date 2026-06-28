#import <React/RCTBridge.h>

@interface RNMBXBridgeManager : NSObject

+ (void)setBridge:(RCTBridge *)bridge;
+ (RCTBridge *)currentBridge;

@end
