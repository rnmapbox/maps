//
//  RCTMGLTouchEvent.h
//  RCTMGL
//
//  Created by Nick Italiano on 8/25/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RCTMGLEvent.h"
@import Mapbox;

@interface RCTMGLMapTouchEvent : RCTMGLEvent

@property (nonatomic, strong) NSArray<NSNumber*> *coordinates;

+ (RCTMGLMapTouchEvent*)makeTapEvent:(MGLMapView*)mapView withPoint:(CGPoint)point;
+ (RCTMGLMapTouchEvent*)makeLongPressEvent:(MGLMapView*)mapView withPoint:(CGPoint)point;

@end
