//
//  RCTMGLMapView.m
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLMapView.h"
#import "RCTMGLUtils.h"
#import "UIView+React.h"

@implementation RCTMGLMapView
{
    NSDictionary *_mapStyleURLS;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
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

- (void)setReactScrollEnabled:(BOOL)reactScrollEnabled
{
    _reactScrollEnabled = reactScrollEnabled;
    self.scrollEnabled = _reactScrollEnabled;
}

- (void)setReactPitchEnabled:(BOOL)reactPitchEnabled
{
    _reactPitchEnabled = reactPitchEnabled;
    self.pitchEnabled = _reactPitchEnabled;
}

- (void)setReactCenterCoordinate:(NSDictionary *)reactCenterCoordinate
{
    _reactCenterCoordinate = reactCenterCoordinate;
    [self _updateCameraIfNeeded:YES];
}

- (void)setReactStyleURL:(NSString *)reactStyleURL
{
    _reactStyleURL = reactStyleURL;
    self.styleURL = [self _getStyleURLFromKey:_reactStyleURL];
}

- (void)setHeading:(double)heading
{
    _heading = heading;
    [self _updateCameraIfNeeded:NO];
}

- (void)setPitch:(double)pitch
{
    _pitch = pitch;
    [self _updateCameraIfNeeded:NO];
}

- (void)setReactZoomLevel:(double)reactZoomLevel
{
    _reactZoomLevel = reactZoomLevel;
    self.zoomLevel = _reactZoomLevel;
}

- (void)setReactMinZoomLevel:(double)reactMinZoomLevel
{
    _reactMinZoomLevel = reactMinZoomLevel;
    self.minimumZoomLevel = _reactMinZoomLevel;
}

- (void)setReactMaxZoomLevel:(double)reactMaxZoomLevel
{
    _reactMaxZoomLevel = reactMaxZoomLevel;
    self.maximumZoomLevel = reactMaxZoomLevel;
}

- (NSURL*)_getStyleURLFromKey:(NSString *)styleKey
{
    NSString *styleURL = [_mapStyleURLS objectForKey:styleKey];
    
    // mapbox base style urls
    if (styleURL != nil) {
        return (NSURL*)styleURL;
    }
    
    // custom style url
    return [NSURL URLWithString:styleKey];
}

- (void)_updateCameraIfNeeded:(BOOL)shouldUpdateCenterCoord
{
    if (shouldUpdateCenterCoord) {
        [self setCenterCoordinate:[RCTMGLUtils GeoJSONPoint:_reactCenterCoordinate] animated:NO];
    } else {
        MGLMapCamera *camera = [self.camera copy];
        camera.pitch = _pitch;
        camera.heading = _heading;
        [self setCamera:camera animated:NO];
    }
}

@end
