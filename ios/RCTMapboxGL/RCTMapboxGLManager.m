//
//  RCTMapboxGLManager.m
//  RCTMapboxGL
//
//  Created by Bobby Sudekum on 4/30/15.
//  Copyright (c) 2015 Mapbox. All rights reserved.
//

#import "RCTMapboxGLManager.h"
#import "RCTMapboxGL.h"
#import <Mapbox/Mapbox.h>
#import "RCTConvert+CoreLocation.h"
#import "RCTConvert+MapKit.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
#import "UIView+React.h"
#import "RCTUIManager.h"

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

- (NSArray *)customDirectEventTypes
{
    return @[
             @"onRegionChange",
             @"onRegionWillChange",
             @"onOpenAnnotation",
             @"onRightAnnotationTapped",
             @"onUpdateUserLocation",
             @"onTap",
             @"onLongPress",
             @"onFinishLoadingMap",
             @"onStartLoadingMap",
             @"onLocateUserFailed"
             ];
}

- (NSDictionary *)constantsToExport
{
    return @{
             @"mapStyles": @{
                     @"light": [[MGLStyle lightStyleURL] absoluteString],
                     @"dark": [[MGLStyle darkStyleURL] absoluteString],
                     @"streets": [[MGLStyle streetsStyleURL] absoluteString],
                     @"emerald": [[MGLStyle emeraldStyleURL] absoluteString],
                     @"satellite": [[MGLStyle satelliteStyleURL] absoluteString],
                     @"hybrid": [[MGLStyle hybridStyleURL] absoluteString],
                     },
             @"userTrackingMode": @{
                     @"none": [NSNumber numberWithUnsignedInt:MGLUserTrackingModeNone],
                     @"follow": [NSNumber numberWithUnsignedInt:MGLUserTrackingModeFollow],
                     @"followWithCourse": [NSNumber numberWithUnsignedInt:MGLUserTrackingModeFollowWithCourse],
                     @"followWithHeading": [NSNumber numberWithUnsignedInt:MGLUserTrackingModeFollowWithHeading]
                     },
             @"userLocationVerticalAlignment" : @{
                     @"top": @(MGLAnnotationVerticalAlignmentTop),
                     @"center": @(MGLAnnotationVerticalAlignmentCenter),
                     @"bottom": @(MGLAnnotationVerticalAlignmentBottom)
                     }
             };
};

RCT_EXPORT_VIEW_PROPERTY(accessToken, NSString);
RCT_EXPORT_VIEW_PROPERTY(centerCoordinate, CLLocationCoordinate2D);
RCT_EXPORT_VIEW_PROPERTY(clipsToBounds, BOOL);
RCT_EXPORT_VIEW_PROPERTY(debugActive, BOOL);
RCT_EXPORT_VIEW_PROPERTY(direction, double);
RCT_EXPORT_VIEW_PROPERTY(rotateEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(showsUserLocation, BOOL);
RCT_EXPORT_VIEW_PROPERTY(styleURL, NSURL);
RCT_EXPORT_VIEW_PROPERTY(userTrackingMode, int);
RCT_EXPORT_VIEW_PROPERTY(zoomEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(zoomLevel, double);
RCT_EXPORT_VIEW_PROPERTY(userLocationVerticalAlignment, int);

RCT_EXPORT_METHOD(getCenterCoordinateZoomLevel:(nonnull NSNumber *)reactTag
                  findEvents:(RCTResponseSenderBlock)callback)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        NSMutableDictionary* callbackDict = [NSMutableDictionary new];
        CLLocationCoordinate2D region = [mapView centerCoordinate];
        double zoom = [mapView zoomLevel];
        
        [callbackDict setValue:@(region.latitude) forKey:@"latitude"];
        [callbackDict setValue:@(region.longitude) forKey:@"longitude"];
        [callbackDict setValue:@(region.longitude) forKey:@"longitude"];
        [callbackDict setValue:@(zoom) forKey:@"zoom"];
        
        callback(@[callbackDict]);
    }];
}

RCT_EXPORT_METHOD(getDirection:(nonnull NSNumber *)reactTag
                  findEvents:(RCTResponseSenderBlock)callback)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        NSMutableDictionary* callbackDict = [NSMutableDictionary new];
        double direction = [mapView direction];
        
        [callbackDict setValue:@(direction) forKey:@"direction"];
        
        callback(@[callbackDict]);
    }];
}



RCT_CUSTOM_VIEW_PROPERTY(annotations, CLLocationCoordinate2D, RCTMapboxGL) {
    if ([json isKindOfClass:[NSArray class]]) {
        NSMutableArray* annotations = [NSMutableArray array];
        id annotationObject;
        NSEnumerator *enumerator = [json objectEnumerator];
        [view removeAllAnnotations];

        while (annotationObject = [enumerator nextObject]) {
            CLLocationCoordinate2D coordinate = [RCTConvert CLLocationCoordinate2D:annotationObject];
            if (CLLocationCoordinate2DIsValid(coordinate)){
                [annotations addObject:convertToMGLAnnotation(annotationObject)];
            }
        }

        view.annotations = annotations;
    }
}

RCT_CUSTOM_VIEW_PROPERTY(contentInset, UIEdgeInsetsMake, RCTMapboxGL)
{
    int top = [json[0] doubleValue];
    int left = [json[3] doubleValue];
    int bottom = [json[2] doubleValue];
    int right = [json[1] doubleValue];
    UIEdgeInsets inset = UIEdgeInsetsMake(top, left, bottom, right);
    view.contentInset = inset;
}

RCT_CUSTOM_VIEW_PROPERTY(attributionButtonIsHidden, BOOL, RCTMapboxGL)
{
    BOOL value = [json boolValue];
    [view setAttributionButtonVisibility:value ? true : false];
}

RCT_CUSTOM_VIEW_PROPERTY(logoIsHidden, BOOL, RCTMapboxGL)
{
    BOOL value = [json boolValue];
    [view setLogoVisibility:value ? true : false];
}

RCT_CUSTOM_VIEW_PROPERTY(compassIsHidden, BOOL, RCTMapboxGL)
{
    BOOL value = [json boolValue];
    [view setCompassVisibility:value ? true : false];
}

RCT_EXPORT_METHOD(setZoomLevelAnimated:(nonnull NSNumber *)reactTag
                  zoomLevel:(double)zoomLevel)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView setZoomLevelAnimated:zoomLevel];
        }
    }];
}
RCT_EXPORT_METHOD(setDirectionAnimated:(nonnull NSNumber *)reactTag
                  heading:(float)heading)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView setDirectionAnimated:heading];
        }
    }];
}

RCT_EXPORT_METHOD(setCenterCoordinateAnimated:(nonnull NSNumber *)reactTag
                  latitude:(float) latitude
                  longitude:(float) longitude)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView setCenterCoordinateAnimated:CLLocationCoordinate2DMake(latitude, longitude)];
        }
    }];
}

RCT_EXPORT_METHOD(setCenterCoordinateZoomLevelAnimated:(nonnull NSNumber *)reactTag
                  latitude:(float) latitude
                  longitude:(float) longitude
                  zoomLevel:(double)zoomLevel)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView setCenterCoordinateZoomLevelAnimated:CLLocationCoordinate2DMake(latitude, longitude) zoomLevel:zoomLevel];
        }
    }];
}

RCT_EXPORT_METHOD(setVisibleCoordinateBoundsAnimated:(nonnull NSNumber *)reactTag
                  latitudeSW:(float) latitudeSW
                  longitudeSW:(float) longitudeSW
                  latitudeNE:(float) latitudeNE
                  longitudeNE:(float) longitudeNE
                  paddingTop:(double) paddingTop
                  paddingRight:(double) paddingRight
                  paddingBottom:(double) paddingBottom
                  paddingLeft:(double) paddingLeft)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            MGLCoordinateBounds coordinatesBounds = MGLCoordinateBoundsMake(CLLocationCoordinate2DMake(latitudeSW, longitudeSW), CLLocationCoordinate2DMake(latitudeNE, longitudeNE));
            [mapView setVisibleCoordinateBounds:coordinatesBounds edgePadding:UIEdgeInsetsMake(paddingTop, paddingLeft, paddingBottom, paddingRight) animated:YES];
        }
    }];
}

RCT_EXPORT_METHOD(selectAnnotationAnimated:(nonnull NSNumber *) reactTag
                  selectedIdentifier:(NSString*)selectedIdentifier)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView selectAnnotationAnimated:selectedIdentifier];
        }
    }];
}

RCT_EXPORT_METHOD(removeAnnotation:(nonnull NSNumber *) reactTag
                  selectedIdentifier:(NSString*)selectedIdentifier)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView removeAnnotation:selectedIdentifier];
        }
    }];
}

RCT_EXPORT_METHOD(removeAllAnnotations:(nonnull NSNumber *) reactTag)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView removeAllAnnotations];
        }
    }];
}

RCT_EXPORT_METHOD(updateAnnotation:(nonnull NSNumber *) reactTag
                  annotation:(NSDictionary *) annotation)
{
    NSString *id = [annotation valueForKey:@"id"];

    if ([id length] != 0) {
        [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
            RCTMapboxGL *mapView = viewRegistry[reactTag];
            if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
                [mapView removeAnnotation:id];
                [mapView addAnnotation:convertToMGLAnnotation(annotation)];
            }
        }];
    } else {
        RCTLogError(@"field `id` is required on all annotation");
    }
}

RCT_EXPORT_METHOD(setUserTrackingMode:(nonnull NSNumber *) reactTag
                  userTrackingMode:(int)userTrackingMode)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView setUserTrackingMode:userTrackingMode];
        }
    }];
}

RCT_EXPORT_METHOD(addAnnotations:(nonnull NSNumber *)reactTag
                  annotations:(NSArray *) annotations)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if([mapView isKindOfClass:[RCTMapboxGL class]]) {
            NSMutableArray* annotationsArray = [NSMutableArray array];
            id annotationObject;
            NSEnumerator *enumerator = [annotations objectEnumerator];

            while (annotationObject = [enumerator nextObject]) {
                CLLocationCoordinate2D coordinate = [RCTConvert CLLocationCoordinate2D:annotationObject];
                if (CLLocationCoordinate2DIsValid(coordinate)){
                    [annotationsArray addObject:convertToMGLAnnotation(annotationObject)];
                }
            }
            mapView.annotations = annotationsArray;
        }
    }];
}

NSObject *convertToMGLAnnotation (NSObject *annotationObject)
{
    if (![annotationObject valueForKey:@"type"]) {
        RCTLogError(@"type point, polyline or polygon required");
        return nil;
    }

    NSString *type = [RCTConvert NSString:[annotationObject valueForKey:@"type"]];

    if ([type  isEqual: @"point"]) {
        return convertObjectToPoint(annotationObject);

    } else if ([type  isEqual: @"polyline"]) {
        return convertObjectToPolyline(annotationObject);


    } else if ([type  isEqual: @"polygon"]) {
        return convertObjectToPolygon(annotationObject);

    } else {
        RCTLogError(@"type point, polyline or polygon required");
        return nil;
    }

}

NSObject *convertObjectToPoint (NSObject *annotationObject)
{
    NSString *title = @"";
    if ([annotationObject valueForKey:@"title"]) {
        title = [RCTConvert NSString:[annotationObject valueForKey:@"title"]];
    }

    NSString *subtitle = @"";
    if ([annotationObject valueForKey:@"subtitle"]) {
        subtitle = [RCTConvert NSString:[annotationObject valueForKey:@"subtitle"]];
    }

    NSString *id = @"";
    if ([annotationObject valueForKey:@"id"]) {
        id = [RCTConvert NSString:[annotationObject valueForKey:@"id"]];
    }

    if ([annotationObject valueForKey:@"rightCalloutAccessory"]) {
        NSObject *rightCalloutAccessory = [annotationObject valueForKey:@"rightCalloutAccessory"];
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

        NSArray *coordinate = [RCTConvert NSArray:[annotationObject valueForKey:@"coordinates"]];
        CLLocationDegrees lat = [coordinate[0] doubleValue];
        CLLocationDegrees lng = [coordinate[1] doubleValue];

        RCTMGLAnnotation *pin = [[RCTMGLAnnotation alloc] initWithLocationRightCallout:CLLocationCoordinate2DMake(lat, lng) title:title subtitle:subtitle id:id rightCalloutAccessory:imageButton];

        if ([annotationObject valueForKey:@"annotationImage"]) {
            NSObject *annotationImage = [annotationObject valueForKey:@"annotationImage"];
            NSString *annotationImageURL = [annotationImage valueForKey:@"url"];
            CGFloat height = (CGFloat)[[annotationImage valueForKey:@"height"] floatValue];
            CGFloat width = (CGFloat)[[annotationImage valueForKey:@"width"] floatValue];
            if (!height || !width) {
                RCTLogError(@"Height and width for image required");
                return nil;
            }
            CGSize annotationImageSize =  CGSizeMake(width, height);
            pin.annotationImageURL = annotationImageURL;
            pin.annotationImageSize = annotationImageSize;
        }

        return pin;

    } else {

        NSArray *coordinate = [RCTConvert NSArray:[annotationObject valueForKey:@"coordinates"]];
        CLLocationDegrees lat = [coordinate[0] doubleValue];
        CLLocationDegrees lng = [coordinate[1] doubleValue];

        RCTMGLAnnotation *point = [[RCTMGLAnnotation alloc] initWithLocation:CLLocationCoordinate2DMake(lat, lng) title:title subtitle:subtitle id:id];

        if ([annotationObject valueForKey:@"annotationImage"]) {
            NSObject *annotationImage = [annotationObject valueForKey:@"annotationImage"];
            NSString *annotationImageURL = [annotationImage valueForKey:@"url"];
            CGFloat height = (CGFloat)[[annotationImage valueForKey:@"height"] floatValue];
            CGFloat width = (CGFloat)[[annotationImage valueForKey:@"width"] floatValue];
            if (!height || !width) {
                RCTLogError(@"Height and width for image required");
                return nil;
            }
            CGSize annotationImageSize =  CGSizeMake(width, height);
            point.annotationImageURL = annotationImageURL;
            point.annotationImageSize = annotationImageSize;
        }

        return point;
    }
}

NSObject *convertObjectToPolyline (NSObject *annotationObject)
{

    NSString *title = @"";
    if ([annotationObject valueForKey:@"title"]) {
        title = [RCTConvert NSString:[annotationObject valueForKey:@"title"]];
    }

    NSString *subtitle = @"";
    if ([annotationObject valueForKey:@"subtitle"]) {
        subtitle = [RCTConvert NSString:[annotationObject valueForKey:@"subtitle"]];
    }

    NSString *id = @"";
    if ([annotationObject valueForKey:@"id"]) {
        id = [RCTConvert NSString:[annotationObject valueForKey:@"id"]];
    }

    NSString *type = @"";
    if ([annotationObject valueForKey:@"type"]) {
        type = [RCTConvert NSString:[annotationObject valueForKey:@"type"]];
    }

    CGFloat strokeAlpha = 1.0;
    if ([annotationObject valueForKey:@"strokeAlpha"]) {
        strokeAlpha = [RCTConvert CGFloat:[annotationObject valueForKey:@"strokeAlpha"]];
    }

    NSString *strokeColor = nil;
    if ([annotationObject valueForKey:@"strokeColor"]) {
        strokeColor = [RCTConvert NSString:[annotationObject valueForKey:@"strokeColor"]];
    }

    double strokeWidth = 3;
    if ([annotationObject valueForKey:@"strokeWidth"]) {
        strokeWidth = [RCTConvert double:[annotationObject valueForKey:@"strokeWidth"]];
    }

    NSArray *coordinates = [RCTConvert NSArray:[annotationObject valueForKey:@"coordinates"]];
    NSUInteger numberOfPoints = coordinates.count;
    int count = 0;
    CLLocationCoordinate2D *coord = malloc(sizeof(CLLocationCoordinate2D) * numberOfPoints);

    if ([annotationObject valueForKey:@"coordinates"]) {
        for (int i = 0; i < [coordinates count]; i++) {
            CLLocationDegrees lat = [coordinates[i][0] doubleValue];
            CLLocationDegrees lng = [coordinates[i][1] doubleValue];
            coord[count] = CLLocationCoordinate2DMake(lat, lng);
            count++;
        }
    }
    RCTMGLAnnotationPolyline *polyline = [RCTMGLAnnotationPolyline polylineAnnotation:coord strokeAlpha:strokeAlpha strokeColor:strokeColor strokeWidth:strokeWidth id:id type:@"polyline" count:count];
    free(coord);
    return polyline;
}

NSObject *convertObjectToPolygon (NSObject *annotationObject)
{
    NSString *title = @"";
    if ([annotationObject valueForKey:@"title"]) {
        title = [RCTConvert NSString:[annotationObject valueForKey:@"title"]];
    }

    NSString *subtitle = @"";
    if ([annotationObject valueForKey:@"subtitle"]) {
        subtitle = [RCTConvert NSString:[annotationObject valueForKey:@"subtitle"]];
    }

    NSString *id = @"";
    if ([annotationObject valueForKey:@"id"]) {
        id = [RCTConvert NSString:[annotationObject valueForKey:@"id"]];
    }

    NSString *type = @"";
    if ([annotationObject valueForKey:@"type"]) {
        type = [RCTConvert NSString:[annotationObject valueForKey:@"type"]];
    }

    CGFloat fillAlpha = 1.0;
    if ([annotationObject valueForKey:@"fillAlpha"]) {
        fillAlpha = [RCTConvert CGFloat:[annotationObject valueForKey:@"fillAlpha"]];
    }

    NSString *fillColor = @"";
    if ([annotationObject valueForKey:@"fillColor"]) {
        fillColor = [RCTConvert NSString:[annotationObject valueForKey:@"fillColor"]];
    }

    CGFloat strokeAlpha = 1.0;
    if ([annotationObject valueForKey:@"strokeAlpha"]) {
        strokeAlpha = [RCTConvert CGFloat:[annotationObject valueForKey:@"strokeAlpha"]];
    }

    NSString *strokeColor = @"";
    if ([annotationObject valueForKey:@"strokeColor"]) {
        strokeColor = [RCTConvert NSString:[annotationObject valueForKey:@"strokeColor"]];
    }

    NSArray *coordinates = [RCTConvert NSArray:[annotationObject valueForKey:@"coordinates"]];
    NSUInteger numberOfPoints = coordinates.count;
    int count = 0;
    CLLocationCoordinate2D *coord = malloc(sizeof(CLLocationCoordinate2D) * numberOfPoints);

    if ([annotationObject valueForKey:@"coordinates"]) {
        for (int i = 0; i < [coordinates count]; i++) {
            CLLocationDegrees lat = [coordinates[i][0] doubleValue];
            CLLocationDegrees lng = [coordinates[i][1] doubleValue];
            coord[count] = CLLocationCoordinate2DMake(lat, lng);
            count++;
        }
    }
    RCTMGLAnnotationPolygon *polygon = [RCTMGLAnnotationPolygon polygonAnnotation:coord fillAlpha:fillAlpha fillColor:fillColor strokeColor:strokeColor strokeAlpha:strokeAlpha id:id type:@"polygon" count:count];
    free(coord);
    return polygon;
}
@end