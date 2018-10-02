//
//  RCTMGLLocation.h
//  RCTMGL
//
//  Created by Nick Italiano on 6/21/18.
//  Copyright © 2018 Mapbox Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>

@interface RCTMGLLocation : NSObject

@property (nonatomic, strong) CLLocation *location;
@property (nonatomic, strong) CLHeading *heading;

- (NSDictionary<NSString *, id> *)toJSON;

@end
