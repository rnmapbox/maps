//
//  RCTMGLTouchEvent.m
//  RCTMGL
//
//  Created by Nick Italiano on 8/25/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLMapTouchEvent.h"
#import "RCTMGLEventTypes.h"
@import Mapbox;

@implementation RCTMGLMapTouchEvent

- (NSDictionary*)payload
{
    return @{ @"type": @"Point", @"coordinates": _coordinates };
}

+ (RCTMGLMapTouchEvent*)makeTapEvent:(MGLMapView*)mapView withPoint:(CGPoint)point
{
    return [RCTMGLMapTouchEvent _fromPoint:point withMapView:mapView andEventType:RCT_MAPBOX_EVENT_TAP];
}

+ (RCTMGLMapTouchEvent*)makeLongPressEvent:(MGLMapView*)mapView withPoint:(CGPoint)point
{
    return [RCTMGLMapTouchEvent _fromPoint:point withMapView:mapView andEventType:RCT_MAPBOX_EVENT_LONGPRESS];
}

+ (RCTMGLMapTouchEvent*)_fromPoint:(CGPoint)point withMapView:(MGLMapView *)mapView andEventType:(NSString*)eventType
{
    CLLocationCoordinate2D coord = [mapView convertPoint:point toCoordinateFromView:mapView];
    RCTMGLMapTouchEvent *event = [[RCTMGLMapTouchEvent alloc] init];
    event.type = eventType;
    event.coordinates = @[@(coord.longitude), @(coord.latitude)];
    return event;
}

@end
