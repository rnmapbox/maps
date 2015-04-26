//
//  mapboxGLViewManager.m
//  mapboxGLReactNative
//
//  Created by Bobby Sudekum on 4/26/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//


#import "mapboxGLViewManager.h"
#import "mapboxGLView.h"
#import "MapboxGL.h"

@implementation mapboxGLViewManager

RCT_EXPORT_MODULE();

RCT_EXPORT_VIEW_PROPERTY(accessToken, NSString)
RCT_EXPORT_VIEW_PROPERTY(showsUserLocation, BOOL)
RCT_EXPORT_VIEW_PROPERTY(rotateEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(zoomLevel, double)
RCT_EXPORT_VIEW_PROPERTY(styleURL, NSURL)

- (UIView *)view
{
  CGRect mapFrame = CGRectMake(0, 0, 400, 668);
  MGLMapView *map = [[MGLMapView alloc] initWithFrame:mapFrame accessToken:@"placeHolder"];
  map.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  return map;
}

@end