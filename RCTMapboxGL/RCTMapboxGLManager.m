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

@interface RCTMapboxGLManager() <MGLMapViewDelegate>
@end

@implementation RCTMapboxGLManager{
    NSMutableDictionary *annotations;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_VIEW_PROPERTY(accessToken, NSString)
RCT_EXPORT_VIEW_PROPERTY(showsUserLocation, BOOL)
RCT_EXPORT_VIEW_PROPERTY(rotateEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(zoomLevel, double)
RCT_EXPORT_VIEW_PROPERTY(debugActive, BOOL)
RCT_EXPORT_VIEW_PROPERTY(styleURL, NSURL)
RCT_EXPORT_VIEW_PROPERTY(direction, double)
RCT_EXPORT_VIEW_PROPERTY(clipsToBounds, BOOL)
RCT_CUSTOM_VIEW_PROPERTY(centerCoordinate, MKCoordinateRegion, MGLMapView)
{
    view.centerCoordinate =  [RCTConvert CLLocationCoordinate2D:json];
}
RCT_CUSTOM_VIEW_PROPERTY(annotations, CLLocationCoordinate2D, MGLMapView){
    if ([json isKindOfClass:[NSArray class]]){
        NSMutableDictionary *pins = [NSMutableDictionary dictionary];
        id anObject;
        NSEnumerator *enumerator = [json objectEnumerator];
        while (anObject = [enumerator nextObject]){
            CLLocationCoordinate2D coordinate = [RCTConvert CLLocationCoordinate2D:anObject];
            if (CLLocationCoordinate2DIsValid(coordinate)){
                NSString *title = @"";
                if ([anObject objectForKey:@"title"]){
                    title = [RCTConvert NSString:[anObject valueForKey:@"title"]];
                }
                NSString *subtitle = @"";
                if ([anObject objectForKey:@"subtitle"]){
                    title = [RCTConvert NSString:[anObject valueForKey:@"subtitle"]];
                }

                MGLAnnotation *pin = [[MGLAnnotation alloc] initWithLocation:CLLocationCoordinate2DMake(coordinate.latitude, coordinate.longitude) title:title subtitle:subtitle];

                NSValue *key = [NSValue valueWithMKCoordinate:pin.coordinate];
                [pins setObject:pin forKey:key];
            }
        }
        if (pins.count){
            if (!annotations){
                annotations = [NSMutableDictionary dictionary];
            }
            NSArray *oldKeys = [annotations allKeys];
            NSArray *newKeys = [pins allKeys];
            // Remove objects from dictionary if new set has no same coordinates
            // and also remove from Map view
            if (oldKeys.count){
                NSMutableArray *removeableKeys = [NSMutableArray array];
                for (NSValue *oldKey in oldKeys){
                    if (![newKeys containsObject:oldKey]){
                        [removeableKeys addObject:oldKey];
                    }
                }
                // remove keys that are already existing and added onto maps
                [pins removeObjectsForKeys:[annotations allKeys]];
                if (removeableKeys.count){
                    NSArray *removed = [annotations objectsForKeys:removeableKeys notFoundMarker:[NSNull null]];
                    [view removeAnnotations: removed];
                    [pins removeObjectsForKeys:removeableKeys];
                    [annotations removeObjectsForKeys:removeableKeys];
                }
            }
            [annotations addEntriesFromDictionary:pins];
            [view addAnnotations:[annotations allValues]];
        }
    }
}

- (UIView *)view
{
    CGFloat width = [UIScreen mainScreen].bounds.size.width;
    CGFloat height = [UIScreen mainScreen].bounds.size.height;
    CGRect windowFrame = CGRectMake(0, 0, width, height);

    MGLMapView *map = [[MGLMapView alloc] initWithFrame:windowFrame accessToken:@"placeHolder"];
    map.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    map.clipsToBounds = YES;
    map.delegate = self;

    return map;
}


- (void)mapView:(RCTMapboxGL *)mapView regionDidChangeAnimated:(BOOL)animated
{
    CLLocationCoordinate2D region = mapView.centerCoordinate;

    NSDictionary *event = @{
                            @"target": mapView.reactTag,
                            @"region": @{
                                    @"latitude": @(region.latitude),
                                    @"longitude": @(region.longitude),
                                    @"zoom": [NSNumber numberWithDouble:mapView.zoomLevel]
                                    }
                            };
    [self.bridge.eventDispatcher sendInputEventWithName:@"topChange" body:event];
}

@end
