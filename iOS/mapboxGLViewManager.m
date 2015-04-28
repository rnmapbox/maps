//
//  mapboxGLViewManager.m
//  mapboxGLReactNative
//
//  Created by Bobby Sudekum on 4/26/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//
#import "mapboxGLViewManager.h"
#import "mapboxGLView.h"
#import "RCTMapManager.h"

@implementation mapboxGLViewManager

RCT_EXPORT_MODULE();

RCT_EXPORT_VIEW_PROPERTY(accessToken, NSString)
RCT_EXPORT_VIEW_PROPERTY(showsUserLocation, BOOL)
RCT_EXPORT_VIEW_PROPERTY(rotateEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(zoomLevel, double)
RCT_EXPORT_VIEW_PROPERTY(styleURL, NSURL)
RCT_EXPORT_VIEW_PROPERTY(clipsToBounds, BOOL)

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

@end
