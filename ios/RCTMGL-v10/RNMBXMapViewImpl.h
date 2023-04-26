@protocol RNMBXMapViewImplProtocol
NS_ASSUME_NONNULL_BEGIN
@end

@interface RNMBXMapViewImplFactory
+ (UIView<RNMBXMapViewImplProtocol>*)createWithFrame: (CGRect) frame NS_SWIFT_NAME(create(frame:));
NS_ASSUME_NONNULL_END
@end
