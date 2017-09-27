//
//  RCTMGLBackgroundLayer.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/25/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLBackgroundLayer.h"
#import "RCTMGLStyle.h"

@implementation RCTMGLBackgroundLayer

- (MGLStyleLayer*)makeLayer:(MGLStyle*)style
{
    return [[MGLBackgroundStyleLayer alloc] initWithIdentifier:self.id];
}

- (void)addStyles
{
    RCTMGLStyle *style = [[RCTMGLStyle alloc] initWithMGLStyle:self.style];
    style.bridge = self.bridge;
    [style backgroundLayer:(MGLBackgroundStyleLayer*)self.styleLayer withReactStyle:self.reactStyle];
}

@end
