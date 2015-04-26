//
//  mapboxGLView.m
//  mapboxGLReactNative
//
//  Created by Bobby Sudekum on 4/26/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "mapboxGLView.h"

@implementation mapboxGLView
{
  CLLocationManager *_locationManager;
}

- (void)reactSetFrame:(CGRect)frame
{
  self.frame = frame;
}


#pragma mark Accessors

- (void)setShowsUserLocation:(BOOL)showsUserLocation
{
  if (self.showsUserLocation != showsUserLocation) {
    if (showsUserLocation && !_locationManager) {
      _locationManager = [[CLLocationManager alloc] init];
      if ([_locationManager respondsToSelector:@selector(requestWhenInUseAuthorization)]) {
        [_locationManager requestWhenInUseAuthorization];
      }
    }
    super.showsUserLocation = showsUserLocation;
    
  }
}

@end