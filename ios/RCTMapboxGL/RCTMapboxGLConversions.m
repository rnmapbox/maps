//
//  RCTMapboxGLConversions.m
//  RCTMapboxGL
//
//  Created by Marius Petcu on 20/06/16.
//  Copyright © 2016 Mapbox. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RCTConvert+CoreLocation.h"
#import "RCTConvert+MapKit.h"
#import "RCTMapboxGL.h"

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

NSObject *convertToMGLAnnotation (NSDictionary *annotationObject)
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
