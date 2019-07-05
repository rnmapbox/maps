//
//  RCTMGLUserLocation.h
//  RCTMGL

#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
#import <Mapbox/MGLUserLocationAnnotationView.h>

@interface RCTMGLUserLocation : NSObject

+ (id)sharedInstance;

- (MGLUserLocationAnnotationView*)hiddenUserAnnotation;

@end
