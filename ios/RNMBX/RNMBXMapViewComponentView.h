#ifdef RCT_NEW_ARCH_ENABLED

#import <UIKit/UIKit.h>

#import <React/RCTUIManager.h>
#import <React/RCTViewComponentView.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNMBXMapViewComponentView : RCTViewComponentView

- (void)dispatchCameraChangedEvent:(NSDictionary*)event;

@end

NS_ASSUME_NONNULL_END

#endif // RCT_NEW_ARCH_ENABLED
