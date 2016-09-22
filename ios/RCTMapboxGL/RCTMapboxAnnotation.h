/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "RCTMapboxAnnotation.h"

#import <MapBox/MapBox.h>
#import <UIKit/UIKit.h>

#import "RCTConvert+MapKit.h"
#import "RCTComponent.h"
#import "RCTMapboxGL.h"

@class RCTBridge;

@interface RCTMapboxAnnotation : MGLAnnotationView <MGLAnnotation>

@property (nonatomic, weak, nullable) RCTMapboxGL *map;
@property (nonatomic, weak, nullable) RCTBridge *bridge;
/**
 The center point (specified as a map coordinate) of the annotation. (required)
 (read-only)
 */
@property (nonatomic) CLLocationCoordinate2D coordinate;

/**
 The string containing the annotation’s title.
 
 Although this property is optional, if you support the selection of annotations
 in your map view, you are expected to provide this property. This string is
 displayed in the callout for the associated annotation.
 */
@property (nonatomic, copy, nullable) NSString *title;

/**
 The string containing the annotation’s subtitle.
 
 This string is displayed in the callout for the associated annotation.
 */
@property (nonatomic, copy, nullable) NSString *subtitle;


@end


