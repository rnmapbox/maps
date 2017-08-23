//
//  RCTConvert+Mapbox.m
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTConvert+Mapbox.h"

@implementation RCTConvert (Mapbox)

+ (CLLocationCoordinate2D)GeoJSONPoint:(id)json
{
    NSDictionary *point = [self NSDictionary:json];
    
    if (![[point objectForKey:@"type"]  isEqual: @"Point"]) {
        return CLLocationCoordinate2DMake(0, 0);
    }
    
    NSArray *coords = (NSArray*)[point objectForKey:@"coordinates"];
    if (coords == nil || coords.count < 2) {
        return CLLocationCoordinate2DMake(0, 0);
    }

    double lat = [[coords objectAtIndex:1] doubleValue];
    double lng = [[coords objectAtIndex:0] doubleValue];
    
    return CLLocationCoordinate2DMake(lat, lng);
}

@end
