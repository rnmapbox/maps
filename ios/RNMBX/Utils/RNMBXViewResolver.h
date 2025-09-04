//
//  RNMBXViewResolver.h
//
//  A utility class for resolving React Native views across both old and new architecture
//  This eliminates code duplication found in multiple RNMBX modules.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

NS_ASSUME_NONNULL_BEGIN

@protocol RNMBXViewResolverDelegate <NSObject>

#ifdef RCT_NEW_ARCH_ENABLED
@property (nonatomic, weak, nullable) RCTViewRegistry *viewRegistry_DEPRECATED;
#endif
@property (nonatomic, weak, nullable) RCTBridge *bridge;

@end

@interface RNMBXViewResolver : NSObject

/**
 * Universal view resolution method with optional type checking
 *
 * @param viewRef The React tag number to resolve
 * @param delegate The module that conforms to RNMBXViewResolverDelegate
 * @param expectedClass The expected view class for type checking (pass nil to skip type checking)
 * @param block The block to execute with the resolved view
 * @param reject The rejection block for promise-based methods
 * @param methodName The name of the calling method for error reporting
 */
+ (void)withViewRef:(NSNumber *)viewRef
           delegate:(id<RNMBXViewResolverDelegate>)delegate
      expectedClass:(nullable Class)expectedClass
              block:(void (^)(UIView *view))block
             reject:(RCTPromiseRejectBlock)reject
         methodName:(NSString *)methodName;

@end

NS_ASSUME_NONNULL_END
