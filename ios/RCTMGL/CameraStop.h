//
//  CameraStop.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/5/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

@import Mapbox;
#import "RCTMGLCamera.h"

@interface CameraStop : NSObject

@property (nonatomic, strong) NSNumber *pitch;
@property (nonatomic, strong) NSNumber *heading;
@property (nonatomic, strong) NSNumber *zoom;
@property (nonatomic, strong) NSNumber *mode;
@property (nonatomic, assign) NSTimeInterval duration;

@property (nonatomic, assign) CLLocationCoordinate2D coordinate;
@property (nonatomic, assign) MGLCoordinateBounds bounds;
@property (nonatomic, assign) UIEdgeInsets padding;

+ (CameraStop*)fromDictionary:(NSDictionary*)args;

@end
