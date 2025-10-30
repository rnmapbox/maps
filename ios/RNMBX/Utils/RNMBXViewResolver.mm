//
//  RNMBXViewResolver.mm
//
//  Implementation of cross-architecture view resolver utility
//

#import "RNMBXViewResolver.h"

@implementation RNMBXViewResolver

+ (void)withViewRef:(NSNumber *)viewRef
           delegate:(id<RNMBXViewResolverDelegate>)delegate
      expectedClass:(nullable Class)expectedClass
              block:(void (^)(UIView *view))block
             reject:(RCTPromiseRejectBlock)reject
         methodName:(NSString *)methodName {

    if (!delegate) {
        reject(@"no_delegate", @"Delegate is required", nil);
        return;
    }

    if (!viewRef) {
        reject(@"no_view_ref", @"View reference is required", nil);
        return;
    }

    if (!block) {
        reject(@"no_block", @"Completion block is required", nil);
        return;
    }

#ifdef RCT_NEW_ARCH_ENABLED
    [delegate.viewRegistry_DEPRECATED addUIBlock:^(RCTViewRegistry *viewRegistry) {
        [self resolveViewWithPolling:viewRef
                            delegate:delegate
                       expectedClass:expectedClass
                               block:block
                              reject:reject
                          methodName:methodName
                         attemptCount:0
                           startTime:nil];
    }];
#else
    [delegate.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        [self resolveViewWithPolling:viewRef
                            delegate:delegate
                       expectedClass:expectedClass
                               block:block
                              reject:reject
                          methodName:methodName
                         attemptCount:0
                           startTime:nil];
    }];
#endif
}

+ (void)resolveViewWithPolling:(NSNumber *)viewRef
                      delegate:(id<RNMBXViewResolverDelegate>)delegate
                 expectedClass:(nullable Class)expectedClass
                         block:(void (^)(UIView *view))block
                        reject:(RCTPromiseRejectBlock)reject
                    methodName:(NSString *)methodName
                   attemptCount:(NSInteger)attemptCount
                     startTime:(nullable NSDate *)startTime {


    UIView *view = [self resolveView:viewRef delegate:delegate];

    if (view) {
        if (expectedClass && ![view isKindOfClass:expectedClass]) {
            reject(@"wrong_view_type",
                   [NSString stringWithFormat:@"View with tag %@ is not of expected type %@ in %@. Found: %@",
                    viewRef, NSStringFromClass(expectedClass), methodName, NSStringFromClass([view class])],
                   nil);
            return;
        }
        block(view);
        return;
    }

    if (!startTime) {
        startTime = [NSDate date];
    }

    NSTimeInterval elapsed = [[NSDate date] timeIntervalSinceDate:startTime];
    if (elapsed >= 0.5) { // 500ms timeout
        NSString *errorMsg = [NSString stringWithFormat:@"Could not find view with tag %@ in %@ after %d attempts over %.1fms",
                      viewRef, methodName, (int)attemptCount + 1, elapsed * 1000];
        NSLog(@"%@", errorMsg);
        reject(@"view_not_found", errorMsg, nil);
        return;
    }

    int64_t delay = (attemptCount == 0) ? (NSEC_PER_MSEC/5) : 10 * NSEC_PER_MSEC;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, delay), dispatch_get_main_queue(), ^{
        [self resolveViewWithPolling:viewRef
                            delegate:delegate
                       expectedClass:expectedClass
                               block:block
                              reject:reject
                          methodName:methodName
                         attemptCount:attemptCount + 1
                           startTime:startTime];
    });
}

#pragma mark - Private Methods

+ (UIView *)resolveView:(NSNumber *)viewRef delegate:(id<RNMBXViewResolverDelegate>)delegate {
#ifdef RCT_NEW_ARCH_ENABLED
    if (delegate.viewRegistry_DEPRECATED) {
        UIView *componentView = [delegate.viewRegistry_DEPRECATED viewForReactTag:viewRef];
        if (componentView) {
            if ([componentView respondsToSelector:@selector(contentView)]) {
                return [componentView performSelector:@selector(contentView)];
            }
            return componentView;
        }
    }

    if (delegate.bridge) {
        return [delegate.bridge.uiManager viewForReactTag:viewRef];
    }
#else
    if (delegate.bridge) {
        return [delegate.bridge.uiManager viewForReactTag:viewRef];
    }
#endif

    return nil;
}

@end
