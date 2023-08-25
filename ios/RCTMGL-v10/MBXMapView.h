#import <React/RCTUIManager.h>

@protocol MBXMapViewProtocol
- (void)setAttributionEnabled:(BOOL)enabled;
@end

@interface MBXMapViewFactory
+ (UIView<MBXMapViewProtocol>*)createWithFrame:(CGRect)frame eventDispatcher:(id<RCTEventDispatcherProtocol>)eventDispatcher NS_SWIFT_NAME(create(frame:eventDispatcher:));
@end
