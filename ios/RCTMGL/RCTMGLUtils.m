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

@end
