//
//  RCTMapboxGLViewManager.m
//  mapboxGLReactNative
//
//  Created by Bobby Sudekum on 4/28/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "RCTMapboxGLViewManager.h"
#import "RCTMapboxGLView.h"
#import "RCTMapManager.h"
#import "RCTConvert+CoreLocation.h"

@implementation mapboxGLViewManager

RCT_EXPORT_MODULE();

- (UIView *)view
{
  CGFloat width = [UIScreen mainScreen].bounds.size.width;
  CGFloat height = [UIScreen mainScreen].bounds.size.height;
  CGRect windowFrame = CGRectMake(0, 0, width, height);
  
  MGLMapView *map = [[MGLMapView alloc] initWithFrame:windowFrame accessToken:@"placeHolder"];
  map.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  map.clipsToBounds = YES;
  return map;
}

RCT_EXPORT_VIEW_PROPERTY(accessToken, NSString)
RCT_EXPORT_VIEW_PROPERTY(showsUserLocation, BOOL)
RCT_EXPORT_VIEW_PROPERTY(rotateEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(zoomLevel, double)
RCT_EXPORT_VIEW_PROPERTY(styleURL, NSURL)
RCT_EXPORT_VIEW_PROPERTY(clipsToBounds, BOOL)
RCT_CUSTOM_VIEW_PROPERTY(centerCoordinate, MKCoordinateRegion, MGLMapView)
{
  view.centerCoordinate =  [RCTConvert CLLocationCoordinate2D:json];
}

@end