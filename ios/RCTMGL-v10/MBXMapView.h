#import <React/RCTUIManager.h>

@protocol MBXMapViewProtocol
- (void)setAttributionEnabled:(BOOL)enabled;
- (void)setAttributionPosition:(NSDictionary<NSString*, NSNumber*>*)position;
- (void)setLogoEnabled:(BOOL)enabled;
- (void)setLogoPosition:(NSDictionary<NSString*, NSNumber*>*)position;

- (void)setCompassEnabled:(BOOL)enabled;
- (void)setCompassFadeWhenNorth:(BOOL)enabled;
- (void)setCompassPosition:(NSDictionary<NSString*, NSNumber*>*)position;
- (void)setCompassViewPosition:(NSInteger)position;
- (void)setCompassViewMargins:(CGPoint)position;
- (void)setCompassImage:(NSString*)position;

- (void)setScaleBarEnabled:(BOOL)enabled;
- (void)setScaleBarPosition:(NSDictionary<NSString*, NSNumber*>*)position;

- (void)setZoomEnabled:(BOOL)enabled;
- (void)setScrollEnabled:(BOOL)enabled;
- (void)setRotateEnabled:(BOOL)enabled;
- (void)setPitchEnabled:(BOOL)enabled;

- (void)setProjection:(NSString*)projection;
- (void)setLocalizeLabels:(NSDictionary*)labels;
- (void)setStyleUrl:(NSString*)url;

- (void)setOnPress:(RCTBubblingEventBlock)callback;
- (void)setOnLongPress:(RCTBubblingEventBlock)callback;
- (void)setOnMapChange:(RCTBubblingEventBlock)callback;

@end

@interface MBXMapViewFactory
+ (UIView<MBXMapViewProtocol>*)createWithFrame:(CGRect)frame eventDispatcher:(id<RCTEventDispatcherProtocol>)eventDispatcher NS_SWIFT_NAME(create(frame:eventDispatcher:));
@end
