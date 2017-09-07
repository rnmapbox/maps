//
//  RCTConvert+Mapbox.h
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <MapKit/MapKit.h>
@import Mapbox;

@interface RCTMGLUtils: NSObject

+ (CLLocationCoordinate2D)fromFeature:(NSString*)json;
+ (MGLCoordinateBounds)fromFeatureCollection:(NSString*)json;
+ (NSTimeInterval)fromMS:(NSNumber*)number;
+ (NSNumber*)clamp:(NSNumber*)value min:(NSNumber*)min max:(NSNumber*)max;

@end
