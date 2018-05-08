//
//  RCTMGLPointAnnotation.m
//  RCTMGL
//
//  Created by Nick Italiano on 10/12/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLPointAnnotation.h"
#import "RCTMGLUtils.h"
#import "UIView+React.h"

const float CENTER_X_OFFSET_BASE = -0.5f;
const float CENTER_Y_OFFSET_BASE = -0.5f;

@implementation RCTMGLPointAnnotation
{
    BOOL isMapSetBeforeFrame;
    UITapGestureRecognizer *customViewTap;
}

- (id)init
{
    if (self = [super init]) {
        customViewTap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(_handleTap:)];
    }
    return self;
}

- (void)insertReactSubview:(UIView *)subview atIndex:(NSInteger)atIndex
{
    if ([subview isKindOfClass:[RCTMGLCallout class]]) {
        self.calloutView = (RCTMGLCallout *)subview;
        self.calloutView.representedObject = self;
    } else {
        [super insertReactSubview:subview atIndex:atIndex];
    }
}

- (void)removeReactSubview:(UIView *)subview
{
    if ([subview isKindOfClass:[RCTMGLCallout class]]) {
        self.calloutView = nil;
    } else {
        [super removeReactSubview:subview];
    }
}

- (void)reactSetFrame:(CGRect)frame
{
    [self _setCenterOffset:frame];
    [super reactSetFrame:frame];

    if (isMapSetBeforeFrame) {
        [self _addAnnotation];
    }
}

- (void)setAnchor:(NSDictionary<NSString *, NSNumber *> *)anchor
{
    _anchor = anchor;
    [self _setCenterOffset:self.frame];
}

- (void)setMap:(MGLMapView *)map
{
    if (map == nil) {
        [_map removeAnnotation:self];
        _map = nil;
    } else {
        _map = map;

        // prevents annotations from flying in from the top left corner
        // if the frame hasn't been set yet
        if (![self _isFrameSet]) {
            isMapSetBeforeFrame = YES;
            return;
        }

        [self _addAnnotation];
    }
}

- (void)setReactSelected:(BOOL)reactSelected
{
    _reactSelected = reactSelected;

    if (_map != nil) {
        if (_reactSelected) {
            [_map selectAnnotation:self animated:NO];
        } else {
            [_map deselectAnnotation:self animated:NO];
        }
    }
}

- (void)setReactCoordinate:(NSString *)reactCoordinate
{
    _reactCoordinate = reactCoordinate;
    [self _updateCoordinate];
}

- (NSString *)reuseIdentifier
{
    return _id;
}

- (NSString *)title
{
    return _reactTitle;
}

- (NSString *)subtitle
{
    return _reactSnippet;
}

- (NSString *)toolTip
{
    return _reactTitle;
}

- (MGLAnnotationView *)getAnnotationView
{
    if (self.reactSubviews.count == 0) {
        // default pin view
        return nil;
    } else {
        // custom view
        self.enabled = YES;
        self.layer.zPosition = [self _getZPosition];
        [self addGestureRecognizer:customViewTap];
        return self;
    }
}

- (CGFloat)_getZPosition
{
    double latitudeMax = 90.0;
    return latitudeMax - self.coordinate.latitude;
}

- (void)_handleTap:(UITapGestureRecognizer *)recognizer
{
    [_map selectAnnotation:self.annotation animated:NO];
}

- (void)_setCenterOffset:(CGRect)frame
{
    if (frame.size.width == 0 || frame.size.height == 0 || _anchor == nil) {
        return;
    }

    float x = [_anchor[@"x"] floatValue];
    float y = [_anchor[@"y"] floatValue];

    // (fullWidthOffset - centerWidthOffset) / 2
    float dx = -(x * frame.size.width - (frame.size.width / 2)) / 2;
    float dy = -(y * frame.size.height - (frame.size.height / 2)) / 2;

    // special cases 0 and 1

    if (x == 0) {
        dx = frame.size.width / 2;
    } else if (x == 1) {
        dy = -frame.size.height / 2;
    }

    if (y == 0) {
        dy = frame.size.width / 2;
    } else if (y == 1) {
        dy = -frame.size.height / 2;
    }

    self.centerOffset = CGVectorMake(dx, dy);
}


- (void)_updateCoordinate
{
    if (_reactCoordinate == nil) {
        return;
    }

    MGLPointFeature *feature = (MGLPointFeature *)[RCTMGLUtils shapeFromGeoJSON:_reactCoordinate];
    if (feature == nil) {
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
       self.coordinate = feature.coordinate;
    });
}

- (void)_addAnnotation
{
    if ([_map.annotations containsObject:self]) {
        return;
    }

    [_map addAnnotation:self];
    if (_reactSelected) {
        [_map selectAnnotation:self animated:NO];
    }
}

- (BOOL)_isFrameSet
{
    return self.frame.size.width > 0 && self.frame.size.height > 0;
}

@end
