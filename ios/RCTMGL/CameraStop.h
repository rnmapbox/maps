//
//  CameraStop.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/5/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

@import Mapbox;

@interface CameraStop : NSObject

@property (nonatomic, assign) NSNumber *pitch;
@property (nonatomic, assign) NSNumber *heading;
@property (nonatomic, assign) NSNumber *zoom;
@property (nonatomic, assign) NSNumber *boundsPaddingLeft;
@property (nonatomic, assign) NSNumber *boundsPaddingRight;
@property (nonatomic, assign) NSNumber *boundsPaddingTop;
@property (nonatomic, assign) NSNumber *boundsPaddingBottom;
@property (nonatomic, assign) NSNumber *mode;
@property (nonatomic, assign) NSTimeInterval duration;

@property (nonatomic, assign) CLLocationCoordinate2D coordinate;
@property (nonatomic, assign) MGLCoordinateBounds bounds;

+ (CameraStop*)fromDictionary:(NSDictionary*)args;

@end
