@protocol RNMBXMapViewImplProtocol
NS_ASSUME_NONNULL_BEGIN
- (void)sayHello:(NSString *)message;
@end

@interface RNMBXMapViewImplFactory
+ (UIView<RNMBXMapViewImplProtocol>*)createWithFrame: (CGRect) frame NS_SWIFT_NAME(create(frame:));
NS_ASSUME_NONNULL_END
@end
