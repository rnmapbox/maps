//
//  CameraUpdateItem.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/6/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "CameraUpdateItem.h"
#import "CameraMode.h"

@implementation CameraUpdateItem

- (void)execute:(RCTMGLMapView *)mapView withCompletionHandler:(void (^)(void))completionHandler
{
    if ([self _areBoundsValid:_cameraStop.bounds]) {
        [self _fitBoundsCamera:mapView withCompletionHandler:completionHandler];
    } else if (_cameraStop.mode == [NSNumber numberWithInt:RCT_MAPBOX_CAMERA_MODE_FLIGHT]) {
        [self _flyToCamera:mapView withCompletionHandler:completionHandler];
    } else if (_cameraStop.mode == [NSNumber numberWithInt:RCT_MAPBOX_CAMERA_MODE_EASE]) {
        [self _moveCamera:mapView animated:YES withCompletionHandler:completionHandler];
    } else {
        [self _moveCamera:mapView animated:NO withCompletionHandler:completionHandler];
    }
}

- (void)_flyToCamera:(RCTMGLMapView*)mapView withCompletionHandler:(void (^)(void))completionHandler
{
    MGLMapCamera *nextCamera = [self _makeCamera:mapView];
    [mapView flyToCamera:nextCamera withDuration:_cameraStop.duration completionHandler:completionHandler];
}

- (void)_moveCamera:(RCTMGLMapView*)mapView animated:(BOOL)animated withCompletionHandler:(void (^)(void))completionHandler
{
    
    if ([self _hasCenterCoordAndZoom]) {
        [self _centerCoordWithZoomCamera:mapView animated:animated withCompletionHandler:completionHandler];
    } else {
        MGLMapCamera *nextCamera = [self _makeCamera:mapView];
        [mapView setCamera:nextCamera
                 withDuration:animated ? _cameraStop.duration : 0
                 animationTimingFunction:[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut]
                 completionHandler:completionHandler];
    }
}

- (void)_fitBoundsCamera:(RCTMGLMapView*)mapView withCompletionHandler:(void (^)(void))completionHandler
{
    MGLCoordinateBounds bounds = _cameraStop.bounds;
    CGFloat paddingTop = [_cameraStop.boundsPaddingTop floatValue];
    CGFloat paddingRight = [_cameraStop.boundsPaddingRight floatValue];
    CGFloat paddingBottom = [_cameraStop.boundsPaddingBottom floatValue];
    CGFloat paddingLeft = [_cameraStop.boundsPaddingLeft floatValue];
    
    CLLocationCoordinate2D coordinates[] = {
        { bounds.ne.latitude, bounds.sw.longitude },
        bounds.sw,
        { bounds.sw.latitude, bounds.ne.longitude },
        bounds.ne
    };

    [mapView setVisibleCoordinates:coordinates
             count:4
             edgePadding:UIEdgeInsetsMake(paddingTop, paddingLeft, paddingBottom, paddingRight)
             direction:mapView.direction
             duration:_cameraStop.duration
             animationTimingFunction:[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut]
             completionHandler:completionHandler];
}

- (void)_centerCoordWithZoomCamera:(RCTMGLMapView*)mapView animated:(BOOL)animated withCompletionHandler:(void (^)(void))completionHandler
{
    CLLocationDirection direction = _cameraStop.heading != nil ? [_cameraStop.heading doubleValue] : mapView.direction;
    [mapView setCenterCoordinate:_cameraStop.coordinate
             zoomLevel:[_cameraStop.zoom doubleValue]
             direction:direction
             animated:animated
             completionHandler:completionHandler];
}

- (MGLMapCamera*)_makeCamera:(RCTMGLMapView*)mapView
{
    MGLMapCamera *nextCamera = [mapView.camera copy];
    
    if (_cameraStop.pitch != nil) {
        nextCamera.pitch = [_cameraStop.pitch floatValue];
    }
    
    if (_cameraStop.heading != nil) {
        nextCamera.heading = [_cameraStop.heading floatValue];
    }
    
    if (_cameraStop.zoom != nil) {
        nextCamera.altitude = [mapView altitudeFromZoom:[_cameraStop.zoom doubleValue]];
    }
    
    if ([self _isCoordValid:_cameraStop.coordinate]) {
        nextCamera.centerCoordinate = _cameraStop.coordinate;
    }
    
    return nextCamera;
}

- (BOOL)_areBoundsValid:(MGLCoordinateBounds)bounds {
    BOOL isValid = CLLocationCoordinate2DIsValid(bounds.ne) && CLLocationCoordinate2DIsValid(bounds.sw);
    
    if (!isValid) {
        return NO;
    }
    
    CLLocationCoordinate2D ne = bounds.ne;
    CLLocationCoordinate2D sw = bounds.sw;
    return [self _isCoordValid:ne] && [self _isCoordValid:sw];
}

- (BOOL)_isCoordValid:(CLLocationCoordinate2D)coord
{
    BOOL isValid = CLLocationCoordinate2DIsValid(_cameraStop.coordinate);
    
    if (!isValid) {
        return NO;
    }
    
    return coord.latitude != 0.0 && coord.longitude != 0.0;
}

- (BOOL)_hasCenterCoordAndZoom
{
    BOOL isValid = CLLocationCoordinate2DIsValid(_cameraStop.coordinate) && _cameraStop.zoom != nil;
    
    if (!isValid) {
        return NO;
    }
    
    return [self _isCoordValid:_cameraStop.coordinate];
}

@end
