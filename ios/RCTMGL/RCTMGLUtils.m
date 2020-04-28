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
    NSError* error = nil;
    MGLShape* result = [MGLShape shapeWithData:data encoding:NSUTF8StringEncoding error:&error];
    if (error != nil) {
      RCTLogWarn(@"Failed to convert data to shape error:%@ src:%@", error, jsonStr);
    }
    return result;
}

+ (NSString *)hashURI:(NSString *)uri
{
    if (uri == nil) {
        return @"-1";
    }
    NSUInteger hash = [uri hash];
    return [NSString stringWithFormat:@"%lu", (unsigned long)hash];
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
    if ([value doubleValue] < [min doubleValue]) return min;
    if ([value doubleValue] > [max doubleValue]) return max;
    return value;
}

+ (UIColor*)toColor:(id)value
{
    return [RCTConvert UIColor:value];
}

+ (CGVector)toCGVector:(NSArray<NSNumber *> *)arr
{
    return CGVectorMake([arr[0] floatValue], [arr[1] floatValue]);
}

+ (void)fetchImage:(RCTBridge*)bridge url:(NSString *)url scale:(double)scale callback:(RCTImageLoaderCompletionBlock)callback
{
    [RCTMGLImageQueue.sharedInstance addImage:url scale:scale bridge:bridge completionHandler:callback];
}

+ (void)fetchImages:(RCTBridge *)bridge style:(MGLStyle *)style objects:(NSDictionary<NSString *, id>*)objects forceUpdate:(BOOL)forceUpdate callback:(void (^)(void))callback
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
    
    void (^imageLoadedBlock)(void) = ^{
        imagesLeftToLoad--;
        
        if (imagesLeftToLoad == 0) {
            callback();
        }
    };
    
    for (NSString *imageName in imageNames) {
        UIImage *foundImage = forceUpdate ? nil : [style imageForName:imageName];
        
        if (forceUpdate || foundImage == nil) {
            NSDictionary* image = objects[imageName];
            BOOL hasScale = [image isKindOfClass:[NSDictionary class]] && ([image objectForKey:@"scale"] != nil);
            double scale = hasScale ? [[image objectForKey:@"scale"] doubleValue] : 1.0;
            [RCTMGLImageQueue.sharedInstance addImage:objects[imageName] scale:scale bridge:bridge completionHandler:^(NSError *error, UIImage *image) {
              if (!image) {
                RCTLogWarn(@"Failed to fetch image: %@ error:%@", imageName, error);
              }
              else {
                dispatch_async(dispatch_get_main_queue(), ^{
                    [weakStyle setImage:image forName:imageName];
                    imageLoadedBlock();
                });
              }
            }];
        } else {
            imageLoadedBlock();
        }
    }
}

@end
