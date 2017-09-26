//
//  RCTMGLLight.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/26/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <UIKit/UIKit.h>
@import Mapbox;

@interface RCTMGLLight : UIView

@property (nonatomic, strong) MGLMapView *map;
@property (nonatomic, strong) NSDictionary *reactStyle;

@end
