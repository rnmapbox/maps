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

- (NSDictionary *)customDirectEventTypes
{
    return @{
             RCTMGLOnRegionChange: @{
                     @"registrationName": @"onRegionChange"
                     },
             RCTMGLOnRegionWillChange: @{
                     @"registrationName": @"onRegionWillChange"
                     },
             RCTMGLOnOpenAnnotation: @{
                     @"registrationName": @"onOpenAnnotation"
                     },
             RCTMGLOnRightAnnotationTapped: @{
                     @"registrationName": @"onRightAnnotationTapped"
                     },
             RCTMGLOnUpdateUserLocation: @{
                     @"registrationName": @"onUpdateUserLocation"
                     }
             };
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
RCT_EXPORT_METHOD(setZoomLevelAnimated:(NSNumber *)reactTag
                  zoomLevel:(double)zoomLevel)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView setZoomLevelAnimated:zoomLevel];
        }
    }];
}
RCT_EXPORT_METHOD(setDirectionAnimated:(NSNumber *)reactTag
                  heading:(float)heading)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView setDirectionAnimated:heading];
        }
    }];
}

RCT_EXPORT_METHOD(setCenterCoordinateAnimated:(NSNumber *)reactTag
                  latitude:(float) latitude
                  longitude:(float) longitude)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView setCenterCoordinateAnimated:CLLocationCoordinate2DMake(latitude, longitude)];
        }
    }];
}

RCT_EXPORT_METHOD(setCenterCoordinateZoomLevelAnimated:(NSNumber *)reactTag
                  latitude:(float) latitude
                  longitude:(float) longitude
                  zoomLevel:(double)zoomLevel)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView setCenterCoordinateZoomLevelAnimated:CLLocationCoordinate2DMake(latitude, longitude) zoomLevel:zoomLevel];
        }
    }];
}

RCT_EXPORT_METHOD(selectAnnotationAnimated:(NSNumber *) reactTag
                  annotationInArray:(NSUInteger)annotationInArray)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView selectAnnotationAnimated:annotationInArray];
        }
    }];
}

RCT_EXPORT_METHOD(removeAnnotation:(NSNumber *) reactTag
                  annotationInArray:(NSUInteger)annotationInArray)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView removeAnnotation:annotationInArray];
        }
    }];
}

RCT_EXPORT_METHOD(addAnnotations:(NSNumber *)reactTag
                  annotations:(NSArray *) annotations)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, RCTSparseArray *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if([mapView isKindOfClass:[RCTMapboxGL class]]) {
            
            if ([annotations isKindOfClass:[NSArray class]]) {
                NSMutableArray* pins = [NSMutableArray array];
                id anObject;
                NSEnumerator *enumerator = [annotations objectEnumerator];
                
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
                        
                        NSString *id = @"";
                        if ([anObject objectForKey:@"id"]) {
                            id = [RCTConvert NSString:[anObject valueForKey:@"id"]];
                        }
                        
                        if ([anObject objectForKey:@"rightCalloutAccessory"]) {
                            NSObject *rightCalloutAccessory = [anObject valueForKey:@"rightCalloutAccessory"];
                            NSString *url = [rightCalloutAccessory valueForKey:@"url"];
                            CGFloat height = (CGFloat)[[rightCalloutAccessory valueForKey:@"height"] floatValue];
                            CGFloat width = (CGFloat)[[rightCalloutAccessory valueForKey:@"width"] floatValue];
                            
                            UIImage *image = nil;
                            
                            if ([url hasPrefix:@"image!"]) {
                                NSString* localImagePath = [url substringFromIndex:6];
                                image = [UIImage imageNamed:localImagePath];
                            }
                            
                            NSURL* checkURL = [NSURL URLWithString:url];
                            if (checkURL && checkURL.scheme && checkURL.host) {
                                image = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:url]]];
                            }
                            
                            UIButton *imageButton = [UIButton buttonWithType:UIButtonTypeCustom];
                            imageButton.frame = CGRectMake(0, 0, height, width);
                            [imageButton setImage:image forState:UIControlStateNormal];
                            
                            RCTMGLAnnotation *pin = [[RCTMGLAnnotation alloc] initWithLocationRightCallout:CLLocationCoordinate2DMake(coordinate.latitude, coordinate.longitude) title:title subtitle:subtitle id:id rightCalloutAccessory:imageButton];
                            [pins addObject:pin];
                        } else {
                            RCTMGLAnnotation *pin = [[RCTMGLAnnotation alloc] initWithLocation:CLLocationCoordinate2DMake(coordinate.latitude, coordinate.longitude) title:title subtitle:subtitle id:id];
                            [pins addObject:pin];
                        }
                        
                    }
                }
                mapView.annotations = pins;
            }
            
        }
    }];
}

RCT_CUSTOM_VIEW_PROPERTY(annotations, CLLocationCoordinate2D, RCTMapboxGL) {
    if ([json isKindOfClass:[NSArray class]]) {
        NSMutableArray* pins = [NSMutableArray array];
        id anObject;
        NSEnumerator *enumerator = [json objectEnumerator];
        
        while (anObject = [enumerator nextObject]) {
            CLLocationCoordinate2D coordinate = [RCTConvert CLLocationCoordinate2D:anObject];
            if (CLLocationCoordinate2DIsValid(coordinate)){
                NSString *title = @"";
                if ([anObject objectForKey:@"title"]) {
                    title = [RCTConvert NSString:[anObject valueForKey:@"title"]];
                }
                
                NSString *subtitle = @"";
                if ([anObject objectForKey:@"subtitle"]) {
                    subtitle = [RCTConvert NSString:[anObject valueForKey:@"subtitle"]];
                }
                
                NSString *id = @"";
                if ([anObject objectForKey:@"id"]) {
                    id = [RCTConvert NSString:[anObject valueForKey:@"id"]];
                }
                
                if ([anObject objectForKey:@"rightCalloutAccessory"]) {
                    NSObject *rightCalloutAccessory = [anObject valueForKey:@"rightCalloutAccessory"];
                    NSString *url = [rightCalloutAccessory valueForKey:@"url"];
                    CGFloat height = (CGFloat)[[rightCalloutAccessory valueForKey:@"height"] floatValue];
                    CGFloat width = (CGFloat)[[rightCalloutAccessory valueForKey:@"width"] floatValue];
                    
                    UIImage *image = nil;
                    
                    if ([url hasPrefix:@"image!"]) {
                        NSString* localImagePath = [url substringFromIndex:6];
                        image = [UIImage imageNamed:localImagePath];
                    }
                    
                    NSURL* checkURL = [NSURL URLWithString:url];
                    if (checkURL && checkURL.scheme && checkURL.host) {
                        image = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:url]]];
                    }
                    
                    UIButton *imageButton = [UIButton buttonWithType:UIButtonTypeCustom];
                    imageButton.frame = CGRectMake(0, 0, height, width);
                    [imageButton setImage:image forState:UIControlStateNormal];
                    
                    RCTMGLAnnotation *pin = [[RCTMGLAnnotation alloc] initWithLocationRightCallout:CLLocationCoordinate2DMake(coordinate.latitude, coordinate.longitude) title:title subtitle:subtitle id:id rightCalloutAccessory:imageButton];
                    [pins addObject:pin];
                } else {
                    RCTMGLAnnotation *pin = [[RCTMGLAnnotation alloc] initWithLocation:CLLocationCoordinate2DMake(coordinate.latitude, coordinate.longitude) title:title subtitle:subtitle id:id];
                    [pins addObject:pin];
                }
                
            }
        }
        
        view.annotations = pins;
    }
}


@end
