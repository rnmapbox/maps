//
//  RCTConvert+Mapbox.m
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLUtils.h"

@import Mapbox;

@implementation RCTMGLUtils

static double const MS_TO_S = 0.001;

+ (CLLocationCoordinate2D)fromFeature:(NSString*)jsonStr
{
    NSData* data = [jsonStr dataUsingEncoding:NSUTF8StringEncoding];
    MGLPointFeature *feature = (MGLPointFeature*)[MGLShape shapeWithData:data encoding:NSUTF8StringEncoding error:nil];
    return feature.coordinate;
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

+ (dispatch_block_t)fetchImage:(RCTBridge*)bridge url:(NSString *)url callback:(RCTImageLoaderCompletionBlock)callback
{
    return [bridge.imageLoader loadImageWithURLRequest:[RCTConvert NSURLRequest:url] callback:callback];
}

+ (void)fetchImages:(RCTBridge *)bridge style:(MGLStyle *)style objects:(NSDictionary<NSString *, NSString *>*)objects callback:(void (^)())callback
{
    dispatch_queue_t concurrentQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    dispatch_queue_t mainQueue = dispatch_get_main_queue();
    
    dispatch_group_t imageQueueGroup = dispatch_group_create();
    
    NSArray<NSString *> *imageNames = objects.allKeys;
    __block NSUInteger imagesLeftToLoad = imageNames.count;
    
    dispatch_group_async(imageQueueGroup, concurrentQueue, ^{
        dispatch_group_enter(imageQueueGroup);
        
        void (^imageLoadedBlock)() = ^{
            imagesLeftToLoad--;
            
            if (imagesLeftToLoad == 0) {
                dispatch_group_leave(imageQueueGroup);
            }
        };
        
        for (NSString *imageName in imageNames) {
            UIImage *foundImage = [style imageForName:imageName];
            
            if (foundImage == nil) {
                [RCTMGLUtils fetchImage:bridge url:objects[imageName] callback:^(NSError *error, UIImage *image) {
                    dispatch_async(mainQueue, ^{
                        [style setImage:image forName:imageName];
                        imageLoadedBlock();
                    });
                }];
            } else {
                imageLoadedBlock();
            }
        }
    });
    
    dispatch_group_notify(imageQueueGroup, mainQueue, ^{ callback(); });
}

@end
