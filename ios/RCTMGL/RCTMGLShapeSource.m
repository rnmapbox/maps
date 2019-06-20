//
//  RCTMGLShapeSource.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/19/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLShapeSource.h"
#import "RCTMGLUtils.h"
#import "RCTMGLMapView.h"

@implementation RCTMGLShapeSource

static UIImage * _placeHolderImage;

- (void)setShape:(NSString *)shape
{
    _shape = shape;
    
    if (self.source != nil) {
        MGLShapeSource *source = (MGLShapeSource *)self.source;
        [source setShape: shape == nil ? nil : [RCTMGLUtils shapeFromGeoJSON:_shape]];
    }
}

- (void)addToMap
{
    if (self.map.style == nil) {
        return;
    }
    [self _addNativeImages:_nativeImages];
    [self _addRemoteImages:_images];
    [super addToMap];
}

- (void)removeFromMap
{
    if (self.map.style == nil) {
        return;
    }
    
    [super removeFromMap];
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

- (MGLSource*)makeSource
{
    NSDictionary<MGLShapeSourceOption, id> *options = [self _getOptions];
    
    if (_shape != nil) {
        MGLShape *shape = [RCTMGLUtils shapeFromGeoJSON:_shape];
        return [[MGLShapeSource alloc] initWithIdentifier:self.id shape:shape options:options];
    }
    
    NSURL *url = [[NSURL alloc] initWithString:_url];
    return [[MGLShapeSource alloc] initWithIdentifier:self.id URL:url options:options];
}

- (NSDictionary<MGLShapeSourceOption, id>*)_getOptions
{
    NSMutableDictionary<MGLShapeSourceOption, id> *options = [[NSMutableDictionary alloc] init];
    
    if (_cluster != nil) {
        options[MGLShapeSourceOptionClustered] = [NSNumber numberWithBool:[_cluster intValue] == 1];
    }
    
    if (_clusterRadius != nil) {
        options[MGLShapeSourceOptionClusterRadius] = _clusterRadius;
    }
    
    if (_clusterMaxZoomLevel != nil) {
        options[MGLShapeSourceOptionMaximumZoomLevelForClustering] = _clusterMaxZoomLevel;
    }
    
    if (_maxZoomLevel != nil) {
        options[MGLShapeSourceOptionMaximumZoomLevel] = _maxZoomLevel;
    }
    
    if (_buffer != nil) {
        options[MGLShapeSourceOptionBuffer] = _buffer;
    }
    
    if (_tolerence != nil) {
        options[MGLShapeSourceOptionSimplificationTolerance] = _tolerence;
    }
    
    return options;
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
            [self.map.style setImage:[RCTMGLShapeSource placeholderImage] forName:imageName];
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

+ (NSString *)placeholderImage {
    if (_placeHolderImage) return _placeHolderImage;
    UIGraphicsBeginImageContextWithOptions(CGSizeMake(1, 1), NO, 0.0);
    _placeHolderImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return _placeHolderImage;
}

@end
