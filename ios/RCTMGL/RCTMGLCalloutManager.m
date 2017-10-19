//
//  RCTMGLCalloutViewManager.m
//  RCTMGL
//
//  Created by Nick Italiano on 10/13/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLCalloutManager.h"
#import "RCTMGLCallout.h"

@implementation RCTMGLCalloutManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
    return [[RCTMGLCallout alloc] init];
}

@end
