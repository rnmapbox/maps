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
#import "RCTMapboxGLConversions.h"

@implementation RCTMapboxGLManager

- (UIView *)view
{
    return [[RCTMapboxGL alloc] initWithEventDispatcher:self.bridge.eventDispatcher];
}

- (NSArray *)customDirectEventTypes
{
    return @[
             @"onRegionChange",
             @"onRegionWillChange",
             @"onChangeUserTrackingMode",
             @"onOpenAnnotation",
             @"onRightAnnotationTapped",
             @"onUpdateUserLocation",
             @"onTap",
             @"onLongPress",
             @"onFinishLoadingMap",
             @"onStartLoadingMap",
             @"onLocateUserFailed",
             @"onOfflineProgressDidChange",
             @"onOfflineMaxAllowedMapboxTiles",
             @"onOfflineDidRecieveError"
             ];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_VIEW_PROPERTY(initialCenterCoordinate, CLLocationCoordinate2D);
RCT_EXPORT_VIEW_PROPERTY(initialZoomLevel, double);
RCT_EXPORT_VIEW_PROPERTY(initialDirection, double);
RCT_EXPORT_VIEW_PROPERTY(clipsToBounds, BOOL);
RCT_EXPORT_VIEW_PROPERTY(debugActive, BOOL);
RCT_EXPORT_VIEW_PROPERTY(rotateEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(zoomEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(showsUserLocation, BOOL);
RCT_EXPORT_VIEW_PROPERTY(styleURL, NSURL);
RCT_EXPORT_VIEW_PROPERTY(userTrackingMode, int);
RCT_EXPORT_VIEW_PROPERTY(attributionButtonIsHidden, BOOL);
RCT_EXPORT_VIEW_PROPERTY(logoIsHidden, BOOL);
RCT_EXPORT_VIEW_PROPERTY(compassIsHidden, BOOL);
RCT_EXPORT_VIEW_PROPERTY(userLocationVerticalAlignment, int);

RCT_CUSTOM_VIEW_PROPERTY(contentInset, UIEdgeInsetsMake, RCTMapboxGL)
{
    int top = [json[0] doubleValue];
    int left = [json[3] doubleValue];
    int bottom = [json[2] doubleValue];
    int right = [json[1] doubleValue];
    UIEdgeInsets inset = UIEdgeInsetsMake(top, left, bottom, right);
    view.contentInset = inset;
}

RCT_CUSTOM_VIEW_PROPERTY(annotations, CLLocationCoordinate2D, RCTMapboxGL)
{
    if ([json isKindOfClass:[NSArray class]]) {
        [view removeAllAnnotations];
        
        id annotationObject;
        NSEnumerator *enumerator = [json objectEnumerator];
        
        while (annotationObject = [enumerator nextObject]) {
            CLLocationCoordinate2D coordinate = [RCTConvert CLLocationCoordinate2D:annotationObject];
            if (CLLocationCoordinate2DIsValid(coordinate)){
                [view addAnnotation:convertToMGLAnnotation(annotationObject)];
            }
        }
    }
}

@end
