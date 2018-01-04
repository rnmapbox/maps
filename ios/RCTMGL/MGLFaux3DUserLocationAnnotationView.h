//
//  MGLFaux3DUserLocationAnnotationView.h
//  RCTMGL
//
//  Created by Nick Italiano on 12/20/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <UIKit/UIKit.h>
@import Mapbox;

extern const CGFloat MGLUserLocationAnnotationDotSize;
extern const CGFloat MGLUserLocationAnnotationHaloSize;

extern const CGFloat MGLUserLocationAnnotationPuckSize;
extern const CGFloat MGLUserLocationAnnotationArrowSize;

// Threshold in radians between heading indicator rotation updates.
extern const CGFloat MGLUserLocationHeadingUpdateThreshold;

@interface MGLFaux3DUserLocationAnnotationView : MGLUserLocationAnnotationView

@end
