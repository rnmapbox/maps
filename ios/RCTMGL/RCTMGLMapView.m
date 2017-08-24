//
//  RCTMGLMapView.m
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLMapView.h"
#import "RCTConvert+Mapbox.h"

@implementation RCTMGLMapView
{
    NSDictionary *_mapStyleURLS;
}

- (instancetype)init
{
    if (self = [super init]) {
        _mapStyleURLS = @{
                          @"mapbox-streets": MGLStyle.streetsStyleURL,
                          @"mapbox-dark": MGLStyle.darkStyleURL,
                          @"mapbox-light": MGLStyle.lightStyleURL,
                          @"mapbox-outdoors": MGLStyle.outdoorsStyleURL,
                          @"mapbox-satellite": MGLStyle.satelliteStyleURL
                          };
    }
    
    return self;
}

- (void)setAnimated:(BOOL)animated
{
    _animated = animated;
}

- (void)setReactCenterCoordinate:(NSDictionary *)reactCenterCoordinate
{
    _reactCenterCoordinate = reactCenterCoordinate;
    [self setCenterCoordinate:[RCTConvert GeoJSONPoint:_reactCenterCoordinate] animated:_animated];
}

- (void)setReactStyleURL:(NSString *)reactStyleURL
{
    _reactStyleURL = reactStyleURL;
    self.styleURL = [self getStyleURLFromKey:_reactStyleURL];
}

- (void)setHeading:(double)heading
{
    _heading = heading;
    MGLMapCamera *camera = [self.camera copy];
    camera.heading = _heading;
    [self setCamera:camera animated: _animated];
}

- (void)setPitch:(double)pitch
{
    _pitch = pitch;
    MGLMapCamera *camera = [self.camera copy];
    camera.pitch = _pitch;
    [self setCamera:camera animated:_animated];
}

- (void)setReactZoomLevel:(double)reactZoomLevel
{
    _reactZoomLevel = reactZoomLevel;
    self.zoomLevel = reactZoomLevel;
}

- (void)setOnPress:(RCTBubblingEventBlock)onPress
{
    _onPress = onPress;
}

- (void)setOnLongPress:(RCTBubblingEventBlock)onLongPress
{
    _onLongPress = onLongPress;
}

- (NSURL*)getStyleURLFromKey:(NSString *)styleKey
{
    NSString *styleURL = [_mapStyleURLS objectForKey:styleKey];
    
    // mapbox base style urls
    if (styleURL != nil) {
        return (NSURL*)styleURL;
    }
    
    // custom style url
    return [NSURL URLWithString:styleKey];
}

@end
