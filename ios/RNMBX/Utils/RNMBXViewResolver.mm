//
//  RNMBXViewResolver.mm
//
//  Implementation of view resolver utility
//

#import "RNMBXViewResolver.h"

// View resolution timeout and delay constants
static const NSTimeInterval MAX_TIMEOUT = 10.0; // 10 seconds
static const int64_t DELAY_ON_FIRST_ATTEMPT = (NSEC_PER_MSEC/5); // 0.2ms
static const int64_t DELAY_ON_NEXT_5_ATTEMPTS = 10 * NSEC_PER_MSEC; // 10ms
static const int64_t DELAY_ON_FURTHER_ATTEMPTS = 200 * NSEC_PER_MSEC; // 200ms

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
    if (elapsed >= MAX_TIMEOUT) {
        NSString *errorMsg = [NSString stringWithFormat:@"Could not find view with tag %@ in %@ after %d attempts over %.1fms",
                      viewRef, methodName, (int)attemptCount + 1, elapsed * 1000];
        NSLog(@"%@", errorMsg);
        reject(@"view_not_found", errorMsg, nil);
        return;
    }

    int64_t delay;
    if (attemptCount == 0) {
        delay = DELAY_ON_FIRST_ATTEMPT;
    } else if (attemptCount <= 5) {
        delay = DELAY_ON_NEXT_5_ATTEMPTS;
    } else {
        delay = DELAY_ON_FURTHER_ATTEMPTS;
    }
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

    return nil;
}

@end
