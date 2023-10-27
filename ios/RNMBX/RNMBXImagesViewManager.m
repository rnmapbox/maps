#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RNMBXImages, RNMBXImagesViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(images, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(nativeImages, NSArray)
RCT_REMAP_VIEW_PROPERTY(onImageMissing, onImageMissing, RCTBubblingEventBlock)

@end
