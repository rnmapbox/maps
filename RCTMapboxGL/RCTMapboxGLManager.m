//
//  RCTMapboxGLManager.m
//  RCTMapboxGL
//
//  Created by Bobby Sudekum on 4/30/15.
//  Copyright (c) 2015 Mapbox. All rights reserved.
//

#import "RCTMapboxGLManager.h"
#import "RCTMapboxGL.h"
#import "MapboxGL.h"
#import "RCTConvert+CoreLocation.h"
#import "RCTConvert+MapKit.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
#import "UIView+React.h"
#import "RCTUIManager.h"
#import "RCTSparseArray.h"

@implementation RCTMapboxGLManager

RCT_EXPORT_MODULE();
@synthesize bridge = _bridge;

- (UIView *)view
{
  return [[RCTMapboxGL alloc] initWithEventDispatcher:self.bridge.eventDispatcher];
}

- (dispatch_queue_t)methodQueue
{
  return _bridge.uiManager.methodQueue;
}

RCT_EXPORT_VIEW_PROPERTY(accessToken, NSString);
RCT_EXPORT_VIEW_PROPERTY(centerCoordinate, CLLocationCoordinate2D);
RCT_EXPORT_VIEW_PROPERTY(clipsToBounds, BOOL);
RCT_EXPORT_VIEW_PROPERTY(debugActive, BOOL);
RCT_EXPORT_VIEW_PROPERTY(direction, double);
RCT_EXPORT_VIEW_PROPERTY(rotateEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(showsUserLocation, BOOL);
RCT_EXPORT_VIEW_PROPERTY(styleURL, NSURL);
RCT_EXPORT_VIEW_PROPERTY(zoomLevel, double);
RCT_EXPORT_METHOD(resetNorth:(NSNumber *)reactTag)
{
  [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    RCTMapboxGL *mapView = viewRegistry[reactTag];
    [mapView resetNorth];
  }];
}
RCT_EXPORT_METHOD(setCenterCoordinateAnimated:(NSNumber *)reactTag
                  latitude:(int) latitude
                  longitude:(int) longitude
                  zoom:(double)zoom)
{
  [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
    RCTMapboxGL *mapView = viewRegistry[reactTag];
    if([mapView isKindOfClass:[RCTMapboxGL class]]) {
      [mapView setCenterCoordinateAnimated:CLLocationCoordinate2DMake(latitude, longitude) zoom:zoom];
      }
  }];
}

RCT_CUSTOM_VIEW_PROPERTY(annotations, CLLocationCoordinate2D, RCTMapboxGL) {
  if ([json isKindOfClass:[NSArray class]]) {
    NSMutableDictionary *pins = [NSMutableDictionary dictionary];
    id anObject;
    NSEnumerator *enumerator = [json objectEnumerator];

    while (anObject = [enumerator nextObject]) {
      CLLocationCoordinate2D coordinate = [RCTConvert CLLocationCoordinate2D:anObject];
      if (CLLocationCoordinate2DIsValid(coordinate)){
        NSString *title = @"";
        if ([anObject objectForKey:@"title"]){
          title = [RCTConvert NSString:[anObject valueForKey:@"title"]];
        }

        NSString *subtitle = @"";
        if ([anObject objectForKey:@"subtitle"]){
          subtitle = [RCTConvert NSString:[anObject valueForKey:@"subtitle"]];
        }

        RCTMGLAnntation *pin = [[RCTMGLAnntation alloc] initWithLocation:CLLocationCoordinate2DMake(coordinate.latitude, coordinate.longitude) title:title subtitle:subtitle];

        NSValue *key = [NSValue valueWithMKCoordinate:pin.coordinate];
        [pins setObject:pin forKey:key];
     }
   }

    view.annotations = pins;
  }
}

@end
