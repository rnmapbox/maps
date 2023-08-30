#ifdef RCT_NEW_ARCH_ENABLED

#import <UIKit/UIKit.h>

#import <React/RCTUIManager.h>
#import <React/RCTViewComponentView.h>

NS_ASSUME_NONNULL_BEGIN

@interface MBXMapViewComponentView : RCTViewComponentView

- (void)dispatchCameraChangedEvent:(NSDictionary*)event;

- (void)takeSnap:(BOOL)writeToDisk resolve:(RCTPromiseResolveBlock)resolve;

@end

NS_ASSUME_NONNULL_END

#endif // RCT_NEW_ARCH_ENABLED
