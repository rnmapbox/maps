//
//  RCTMGLPointAnnotation.h
//  RCTMGL
//
//  Created by Nick Italiano on 10/12/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <React/RCTComponent.h>
#import <UIKit/UIKit.h>
#import <React/RCTView.h>
#import "RCTMGLCallout.h"

@import Mapbox;

@interface RCTMGLPointAnnotation : MGLAnnotationView<MGLAnnotation>

@property (nonatomic, weak) MGLMapView *map;
@property (nonatomic, strong) RCTMGLCallout *calloutView;

@property (nonatomic, copy) NSString *id;
@property (nonatomic, copy) NSString *reactTitle;
@property (nonatomic, copy) NSString *reactSnippet;

@property (nonatomic, copy) NSString *reactCoordinate;
@property (nonatomic, assign) CLLocationCoordinate2D coordinate;

@property (nonatomic, copy) NSDictionary<NSString *, NSNumber *> *anchor;

@property (nonatomic, copy) RCTBubblingEventBlock onSelected;
@property (nonatomic, copy) RCTBubblingEventBlock onDeselected;

@property (nonatomic, assign) BOOL reactSelected;

- (MGLAnnotationView *)getAnnotationView;

@end
