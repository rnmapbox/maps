#import "RCTMGLImagesManager.h"
#import "RCTMGLImages.h"

@implementation RCTMGLImagesManager

RCT_EXPORT_MODULE()

RCT_EXPORT_VIEW_PROPERTY(id, NSString)
RCT_EXPORT_VIEW_PROPERTY(images, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(nativeImages, NSArray)

RCT_REMAP_VIEW_PROPERTY(onImageMissing, onImageMissing, RCTBubblingEventBlock)

- (UIView*)view
{
    RCTMGLImages *images = [RCTMGLImages new];
    images.bridge = self.bridge;
    return images;
}

@end
