//
//  CameraUpdateItem.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/6/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "CameraUpdateItem.h"
#import "CameraMode.h"


@interface MGLMapView(FlyToWithPadding)
- (void)_flyToCamera:(MGLMapCamera *)camera edgePadding:(UIEdgeInsets)insets withDuration:(NSTimeInterval)duration peakAltitude:(CLLocationDistance)peakAltitude completionHandler:(nullable void (^)(void))completion;
@end

@interface RCTMGLCameraWithPadding : MGLMapCamera

@property (nonatomic) MGLMapCamera* _Nonnull camera;
@property (nonatomic) UIEdgeInsets boundsPadding;

@end

@implementation RCTMGLCameraWithPadding

@end

@implementation CameraUpdateItem

- (void)execute:(RCTMGLMapView *)mapView withCompletionHandler:(void (^)(void))completionHandler
{
    if (_cameraStop.mode == [NSNumber numberWithInt:RCT_MAPBOX_CAMERA_MODE_FLIGHT]) {
        [self _flyToCamera:mapView withCompletionHandler:completionHandler];
    } else if (_cameraStop.mode == [NSNumber numberWithInt:RCT_MAPBOX_CAMERA_MODE_EASE]) {
        [self _moveCamera:mapView animated:YES withCompletionHandler:completionHandler];
    } else if ([self _areBoundsValid:_cameraStop.bounds]) {
        [self _fitBoundsCamera:mapView withCompletionHandler:completionHandler];
    } else {
        [self _moveCamera:mapView animated:NO withCompletionHandler:completionHandler];
    }
}

- (void)_flyToCamera:(RCTMGLMapView*)mapView withCompletionHandler:(void (^)(void))completionHandler
{
    RCTMGLCameraWithPadding *nextCamera = [self _makeCamera:mapView];

    if ([mapView respondsToSelector:@selector(_flyToCamera:edgePadding:withDuration:peakAltitude:completionHandler:)]) {
        [mapView _flyToCamera:nextCamera.camera edgePadding:nextCamera.boundsPadding withDuration:_cameraStop.duration peakAltitude:-1 completionHandler:completionHandler];
    } else {
        [mapView flyToCamera:nextCamera.camera withDuration:_cameraStop.duration completionHandler:completionHandler];
    }
}

- (void)_moveCamera:(RCTMGLMapView*)mapView animated:(BOOL)animated withCompletionHandler:(void (^)(void))completionHandler
{
    if ([self _hasCenterCoordAndZoom]) {
        [self _centerCoordWithZoomCamera:mapView animated:animated withCompletionHandler:completionHandler];
    } else {
        RCTMGLCameraWithPadding *nextCamera = [self _makeCamera:mapView];

        [mapView setCamera:nextCamera.camera
                 withDuration:animated ? _cameraStop.duration : 0
                 animationTimingFunction:[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut]
                 edgePadding:nextCamera.boundsPadding
                 completionHandler:completionHandler];
    }
}

- (UIEdgeInsets)_clippedPadding:(UIEdgeInsets)padding forView:(RCTMGLMapView*)mapView
{
    UIEdgeInsets result = padding;
    if (result.top + result.bottom >= mapView.frame.size.height) {
        double overflow =  result.top + result.bottom - mapView.frame.size.height;
        result.top -= overflow / 2.0 + 1;
        result.bottom -= overflow / 2.0 + 1;
    }
    if (result.left + result.right >= mapView.frame.size.width) {
        double overflow =  result.left + result.right - mapView.frame.size.width;
        result.left -= overflow / 2.0 + 1;
        result.right -= overflow / 2.0 + 1;
    }
    return result;
}

- (void)_fitBoundsCamera:(RCTMGLMapView*)mapView withCompletionHandler:(void (^)(void))completionHandler
{
    MGLCoordinateBounds bounds = _cameraStop.bounds;
    CLLocationCoordinate2D coordinates[] = {
        { bounds.ne.latitude, bounds.sw.longitude },
        bounds.sw,
        { bounds.sw.latitude, bounds.ne.longitude },
        bounds.ne
    };

    [mapView setVisibleCoordinates:coordinates
             count:4
             edgePadding:[self _clippedPadding:_cameraStop.boundsPadding forView:mapView]
             direction:mapView.direction
             duration:_cameraStop.duration
             animationTimingFunction:[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut]
             completionHandler:completionHandler];
}

- (void)_centerCoordWithZoomCamera:(RCTMGLMapView*)mapView animated:(BOOL)animated withCompletionHandler:(void (^)(void))completionHandler
{
    MGLMapCamera *camera = [MGLMapCamera cameraLookingAtCenterCoordinate:_cameraStop.coordinate
                                    fromDistance:[mapView altitudeFromZoom:[_cameraStop.zoom doubleValue] atLatitude:_cameraStop.coordinate.latitude]
                                    pitch:[_cameraStop.pitch floatValue]
                                    heading:[_cameraStop.heading floatValue]];
    [mapView setCamera:camera
                withDuration:animated ? _cameraStop.duration : 0
                animationTimingFunction:[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut]
                completionHandler:completionHandler];
}

- (RCTMGLCameraWithPadding*)_makeCamera:(RCTMGLMapView*)mapView
{
    MGLMapCamera *nextCamera = [mapView.camera copy];
    
    if (_cameraStop.pitch != nil) {
        nextCamera.pitch = [_cameraStop.pitch floatValue];
    }
    
    if (_cameraStop.heading != nil) {
        nextCamera.heading = [_cameraStop.heading floatValue];
    }
    
    if ([self _isCoordValid:_cameraStop.coordinate]) {
        nextCamera.centerCoordinate = _cameraStop.coordinate;
    } else if ([self _areBoundsValid:_cameraStop.bounds]) {
        MGLMapCamera *boundsCamera = [mapView camera:nextCamera fittingCoordinateBounds:_cameraStop.bounds edgePadding: [self _clippedPadding:_cameraStop.boundsPadding forView:mapView]];
        nextCamera.centerCoordinate = boundsCamera.centerCoordinate;
        nextCamera.altitude = boundsCamera.altitude;
    }
    
    if (_cameraStop.zoom != nil) {
        nextCamera.altitude = [mapView altitudeFromZoom:[_cameraStop.zoom doubleValue] atLatitude:nextCamera.centerCoordinate.latitude atPitch:nextCamera.pitch];
    }
    
    RCTMGLCameraWithPadding* cameraWithPadding = [[RCTMGLCameraWithPadding alloc] init];
    cameraWithPadding.camera = nextCamera;
    cameraWithPadding.boundsPadding = [self _clippedPadding:_cameraStop.boundsPadding forView:mapView];
    return cameraWithPadding;
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
    
    return YES;
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
