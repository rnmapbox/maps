import MapboxMaps

class RCTMGLImages : UIView, RCTMGLMapComponent {
  
  var bridge : RCTBridge! = nil
  var remoteImages : [String:String] = [:]
  
  
  @objc
  var onImageMissing: RCTBubblingEventBlock? = nil
  
  @objc
  var images : [String:Any] = [:]
  
  @objc
  var nativeImages: [String] = []
  
  func addToMap(_ map: RCTMGLMapView) {
    map.images.append(self)
    map.setupEvents()
    
    self.addNativeImages(style: map.mapboxMap.style, nativeImages: nativeImages)
    self.addRemoteImages(style: map.mapboxMap.style, remoteImages: images)
  }
  
  func removeFromMap(_ map: RCTMGLMapView) {
    // v10todo
  }
  
  func addRemoteImages(style: Style, remoteImages: [String: Any]) {
    var missingImages : [String:Any] = [:]
    
    // Add image placeholder for images that are not yet available in the style. This way
    // we can load the images asynchronously and add the ShapeSource to the map without delay.
    // The same is required when this ShapeSource is updated with new/added images and the
    // data references them. In which case addMissingImageToStyle will take care of loading
    // them in a similar way.
    //
    // See also: https://github.com/mapbox/mapbox-gl-native/pull/14253#issuecomment-478827792
    
    for imageName in remoteImages.keys {
      if style.styleManager.getStyleImage(forImageId: imageName) == nil {
        try! style.addImage(placeholderImage, id: imageName, stretchX: [], stretchY: [])
        missingImages[imageName] = remoteImages[imageName]
      }
    }
    
    if missingImages.count > 0 {
      RCTMGLUtils.fetchImages(bridge, style: style, objects: missingImages, forceUpdate: true, callback: { })
      
    }
  }
  
  public func addMissingImageToStyle(style: Style, imageName: String) -> Bool {
    if nativeImages.contains(imageName) {
      addNativeImages(style: style, nativeImages: [imageName])
      return true
    }
    
    if let remoteImage = images[imageName] {
      addRemoteImages(style: style, remoteImages: [imageName: remoteImage])
      return true
    }
    return false
  }
  
  public func sendImageMissingEvent(imageName: String, event: Event) {
    let payload = ["imageKey":imageName]
    let event = RCTMGLEvent(type: .imageMissing, payload: payload)
    if let onImageMissing = onImageMissing {
      onImageMissing(event.toJSON())
    }
  }
  
  func addNativeImages(style: Style, nativeImages: [String]) {
    for imageName in nativeImages {
      if style.styleManager.getStyleImage(forImageId: imageName) == nil {
        let image = UIImage(named: imageName)!
        try! style.addImage(image, id: imageName, stretchX: [], stretchY: [])
      }
    }
  }
  
  lazy var placeholderImage : UIImage = {
    UIGraphicsBeginImageContextWithOptions(CGSize(width: 1, height: 1), false, 0.0)
    let result = UIGraphicsGetImageFromCurrentImageContext()!
    UIGraphicsEndImageContext()
    return result
  }()

}
/*
#import "RCTMGLImages.h"
#import "UIView+React.h"
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

@end
*/
