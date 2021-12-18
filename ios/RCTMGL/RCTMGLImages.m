#import "RCTMGLImages.h"
#import <React/UIView+React.h>
#import "RCTMGLMapView.h"
#import "RCTMGLUtils.h"
#import "RCTMGLEvent.h"
#import "RCTMGLEventTypes.h"


@implementation RCTMGLImages : UIView

static UIImage * _placeHolderImage;

- (void)addToMap
{
    if (self.map.style == nil) {
        return;
    }
    [self _addNativeImages:_nativeImages];
    [self _addRemoteImages:_images];
}

- (void)removeFromMap
{
    if (self.map.style == nil) {
        return;
    }
    
    [self _removeImages];
}

- (void)_removeImages
{
    if ([self _hasImages]) {
        NSArray<NSString *> *imageNames = _images.allKeys;
        
        for (NSString *imageName in imageNames) {
            [self.map.style removeImageForName:imageName];
        }
    }
    
    if ([self _hasNativeImages]) {
        for (NSString *imageName in _nativeImages) {
            [self.map.style removeImageForName:imageName];
        }
    }
}

-(BOOL)addMissingImageToStyle:(NSString *)imageName {
    if (_nativeImages && [_nativeImages containsObject:imageName]) {
        [self _addNativeImages:@[imageName]];
        return true;
    }
    
    NSString *remoteImage = _images != nil ? [_images objectForKey:imageName] : nil;
    if (remoteImage) {
        [self _addRemoteImages:@{imageName: remoteImage}];
        return true;
    }
    return false;
}

- (void) sendImageMissingEvent:(NSString *)imageName {
    NSDictionary *payload = @{ @"imageKey": imageName };
    RCTMGLEvent *event = [RCTMGLEvent makeEvent:RCT_MAPBOX_IMAGES_MISSING_IMAGE withPayload:payload];
    if (_onImageMissing) {
        _onImageMissing([event toJSON]);
    }
}

- (void)_addNativeImages:(NSArray<NSString *>*)nativeImages
{
    if (!nativeImages) return;

    for (NSString *imageName in nativeImages) {
        // only add native images if they are not in the style yet (similar to [RCTMGLUtils fetchImages: style:])
        if (![self.map.style imageForName:imageName]) {
            UIImage *image = [UIImage imageNamed:imageName];
            [self.map.style setImage:image forName:imageName];
        }
    }
}

- (void)_addRemoteImages:(NSDictionary<NSString *, NSString *>*)remoteImages
{
    if (!remoteImages) return;
    NSDictionary<NSString *, NSString *> *missingImages = [NSMutableDictionary new];
    
    // Add image placeholder for images that are not yet available in the style. This way
    // we can load the images asynchronously and add the ShapeSource to the map without delay.
    // The same is required when this ShapeSource is updated with new/added images and the
    // data references them. In which case addMissingImageToStyle will take care of loading
    // them in a similar way.
    //
    // See also: https://github.com/mapbox/mapbox-gl-native/pull/14253#issuecomment-478827792
    for (NSString *imageName in remoteImages.allKeys) {
        if (![self.map.style imageForName:imageName]) {
            [self.map.style setImage:[RCTMGLImages placeholderImage] forName:imageName];
            [missingImages setValue:_images[imageName] forKey:imageName];
        }
    }
    
    if (missingImages.count > 0) {
        // forceUpdate to ensure the placeholder images are updated
        [RCTMGLUtils fetchImages:_bridge style:self.map.style objects:_images forceUpdate:true callback:^{ }];
    }
}

- (BOOL)_hasImages
{
    return _images != nil && _images.count > 0;
}

- (BOOL)_hasNativeImages
{
    return _nativeImages != nil && _nativeImages.count > 0;
}

+ (UIImage *)placeholderImage {
    if (_placeHolderImage) return _placeHolderImage;
    UIGraphicsBeginImageContextWithOptions(CGSizeMake(1, 1), NO, 0.0);
    _placeHolderImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return _placeHolderImage;
}

@end
