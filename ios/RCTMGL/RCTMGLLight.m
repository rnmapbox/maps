//
//  RCTMGLLight.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/26/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLLight.h"
#import "RCTMGLStyle.h"

@implementation RCTMGLLight
{
    MGLLight *internalLight;
}

- (void)setReactStyle:(NSDictionary *)reactStyle
{
    _reactStyle = reactStyle;
    
    if (_map != nil) {
        [self addStyles];
    }
}

- (void)setMap:(MGLMapView *)map
{
    _map = map;
    [self addStyles];
}

- (BOOL)isAddedToMap {
    return _map != NULL;
}

- (void)addStyles
{
    MGLLight *light = [[MGLLight alloc] init];
    RCTMGLStyle *style = [[RCTMGLStyle alloc] init];
    [style lightLayer:light withReactStyle:_reactStyle isValid:^{
        return [self isAddedToMap];
    }];
    _map.style.light = light;
}

@end
