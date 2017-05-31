#import "RCTMapboxAnnotation.h"

#import <Mapbox/Mapbox.h>
#import <UIKit/UIKit.h>

#import <React/RCTConvert.h>
#import <React/RCTComponent.h>
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
@property (nonatomic, copy, nullable) NSString *id;

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


