//
//  RCTConvert+Mapbox.m
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLUtils.h"
#import "RCTMGLImageQueue.h"

@import Mapbox;

@implementation RCTMGLUtils

static double const MS_TO_S = 0.001;

+ (CLLocationCoordinate2D)fromFeature:(NSString*)jsonStr
{
    NSData* data = [jsonStr dataUsingEncoding:NSUTF8StringEncoding];
    MGLPointFeature *feature = (MGLPointFeature*)[MGLShape shapeWithData:data encoding:NSUTF8StringEncoding error:nil];
    return feature.coordinate;
}

+ (UIEdgeInsets)toUIEdgeInsets:(NSArray<NSNumber *> *)arr
{
    return UIEdgeInsetsMake([arr[0] floatValue], [arr[1] floatValue], [arr[2] floatValue], [arr[3] floatValue]);
}

+ (MGLShape*)shapeFromGeoJSON:(NSString*)jsonStr
{
    NSData* data = [jsonStr dataUsingEncoding:NSUTF8StringEncoding];
    return [MGLShape shapeWithData:data encoding:NSUTF8StringEncoding error:nil];
}

+ (MGLCoordinateBounds)fromFeatureCollection:(NSString*)jsonStr
{
    NSData* data = [jsonStr dataUsingEncoding:NSUTF8StringEncoding];
    MGLShapeCollectionFeature *featureCollection = (MGLShapeCollectionFeature*)[MGLShapeCollectionFeature shapeWithData:data encoding:NSUTF8StringEncoding error:nil];
    
    CLLocationCoordinate2D ne = featureCollection.shapes[0].coordinate;
    CLLocationCoordinate2D sw = featureCollection.shapes[1].coordinate;
    
    return MGLCoordinateBoundsMake(sw, ne);
}

+ (NSArray<NSNumber *> *)fromCoordinateBounds:(MGLCoordinateBounds)bounds
{
    return @[
        @[@(bounds.ne.longitude), @(bounds.ne.latitude)],
        @[@(bounds.sw.longitude), @(bounds.sw.latitude)]
    ];
}

+ (NSTimeInterval)fromMS:(NSNumber *)number
{
    return [number doubleValue] * MS_TO_S;
}

+ (NSNumber*)clamp:(NSNumber *)value min:(NSNumber *)min max:(NSNumber *)max
{
    return MAX(MIN(value, max), min);
}

+ (UIColor*)toColor:(id)value
{
    return [RCTConvert UIColor:value];
}

+ (CGVector)toCGVector:(NSArray<NSNumber *> *)arr
{
    return CGVectorMake([arr[0] floatValue], [arr[1] floatValue]);
}

+ (void)fetchImage:(RCTBridge*)bridge url:(NSString *)url callback:(RCTImageLoaderCompletionBlock)callback
{
    [RCTMGLImageQueue.sharedInstance addImage:url bridge:bridge completionHandler:callback];
}

+ (void)fetchImages:(RCTBridge *)bridge style:(MGLStyle *)style objects:(NSDictionary<NSString *, NSString *>*)objects callback:(void (^)())callback
{
    if (objects == nil) {
        callback();
        return;
    }
    
    NSArray<NSString *> *imageNames = objects.allKeys;
    if (imageNames.count == 0) {
        callback();
        return;
    }
    
    __block NSUInteger imagesLeftToLoad = imageNames.count;
    __weak MGLStyle *weakStyle = style;
    
    void (^imageLoadedBlock)() = ^{
        imagesLeftToLoad--;
        
        if (imagesLeftToLoad == 0) {
            callback();
        }
    };
    
    for (NSString *imageName in imageNames) {
        UIImage *foundImage = [style imageForName:imageName];
        
        if (foundImage == nil) {
            [RCTMGLImageQueue.sharedInstance addImage:objects[imageName] bridge:bridge completionHandler:^(NSError *error, UIImage *image) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    [weakStyle setImage:image forName:imageName];
                    imageLoadedBlock();
                });
            }];
        } else {
            imageLoadedBlock();
        }
    }
}

@end
