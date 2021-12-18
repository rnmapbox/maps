//
//  RCTMGLCalloutView.m
//  RCTMGL
//
//  Created by Nick Italiano on 10/13/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLCallout.h"
#import <React/UIView+React.h>

@implementation RCTMGLCallout
{
    id <MGLAnnotation> _representedObject;
    __unused UIView *_leftAccessoryView;/* unused */
    __unused UIView *_rightAccessoryView;/* unused */
    __weak id <MGLCalloutViewDelegate> _delegate;
    BOOL _dismissesAutomatically;
    BOOL _anchoredToAnnotation;
}

@synthesize representedObject = _representedObject;
@synthesize leftAccessoryView = _leftAccessoryView;/* unused */
@synthesize rightAccessoryView = _rightAccessoryView;/* unused */
@synthesize delegate = _delegate;
@synthesize anchoredToAnnotation = _anchoredToAnnotation;
@synthesize dismissesAutomatically = _dismissesAutomatically;

- (instancetype)init
{
    if (self = [super init]) {
        // prevent tap from bubbling up to it's superview
        UITapGestureRecognizer *captureTap = [[UITapGestureRecognizer alloc] initWithTarget:self action:nil];
        [self addGestureRecognizer:captureTap];
    }
    return self;
}

// https://github.com/mapbox/mapbox-gl-native/issues/9228
- (void)setCenter:(CGPoint)center {
    center.y = center.y - CGRectGetMidY(self.bounds);
    [super setCenter:center];
}

- (void)presentCalloutFromRect:(CGRect)rect inView:(UIView *)view constrainedToRect:(CGRect)constrainedRect animated:(BOOL)animated;
{
    // we want to attach to our parents parent to be on the same zPosition stack, so the callout will appear over other custom views
    [view.superview addSubview:self];
    
    // adjust frame
    double centerX = rect.origin.x + (rect.size.width / 2);
    CGPoint center = CGPointMake(centerX, rect.origin.y);
    [self setCenter:center];
}

- (void)dismissCalloutAnimated:(BOOL)animated
{
    [self removeFromSuperview];
}

- (BOOL)dismissesAutomatically {
    return NO;
}

- (BOOL)isAnchoredToAnnotation {
    return YES;
}

- (void)update
{
    [self setCenter:self.center];
}

@end
