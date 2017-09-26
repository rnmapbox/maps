//
//  RCTMGLLightManager.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/26/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLLightManager.h"
#import "RCTMGLLight.h"

@implementation RCTMGLLightManager

RCT_EXPORT_MODULE()

RCT_EXPORT_VIEW_PROPERTY(reactStyle, NSDictionary);

- (UIView*)view
{
    return [RCTMGLLight new];
}

@end
