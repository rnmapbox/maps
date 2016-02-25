//
//  RCTMapboxGL.h
//  RCTMapboxGL
//
//  Created by Bobby Sudekum on 4/30/15.
//  Copyright (c) 2015 Mapbox. All rights reserved.
//

#import <Mapbox/Mapbox.h>
#import "RCTView.h"
#import "RCTEventDispatcher.h"
#import "RCTBridgeModule.h"

@interface RCTMapboxGL : RCTView <MGLMapViewDelegate, RCTBridgeModule>

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher;

- (void)setAccessToken:(NSString *)accessToken;
- (void)setAnnotations:(NSArray *)annotations;
- (void)setCenterCoordinate:(CLLocationCoordinate2D)centerCoordinate;
- (void)setClipsToBounds:(BOOL)clipsToBounds;
- (void)setDebugActive:(BOOL)debugActive;
- (void)setDirection:(double)direction;
- (void)setRotateEnabled:(BOOL)rotateEnabled;
- (void)setScrollEnabled:(BOOL)scrollEnabled;
- (void)setZoomEnabled:(BOOL)zoomEnabled;
- (void)setShowsUserLocation:(BOOL)showsUserLocation;
- (void)setStyleURL:(NSURL *)styleURL;
- (void)setZoomLevel:(double)zoomLevel;
- (void)setUserTrackingMode:(int)userTrackingMode;
- (void)setZoomLevelAnimated:(double)zoomLevel;
- (void)setDirectionAnimated:(int)heading;
- (void)setCenterCoordinateAnimated:(CLLocationCoordinate2D)coordinates;
- (void)setCenterCoordinateZoomLevelAnimated:(CLLocationCoordinate2D)coordinates zoomLevel:(double)zoomLevel;
- (void)setCameraAnimated:(MGLMapCamera*)camera withDuration:(int)duration animationTimingFunction:(CAMediaTimingFunction*)function;
- (void)selectAnnotationAnimated:(NSString*)selectedId;
- (void)addAnnotation:(NSObject *)annotation;
- (void)removeAnnotation:(NSString*)selectedIdentifier;
- (void)removeAllAnnotations;
- (void)setVisibleCoordinateBounds:(MGLCoordinateBounds)bounds edgePadding:(UIEdgeInsets)padding animated:(BOOL)animated;
- (void)setAttributionButtonVisibility:(BOOL)isVisible;
- (void)setLogoVisibility:(BOOL)isVisible;
- (void)setCompassVisibility:(BOOL)isVisible;
- (double)zoomLevel;
- (double)direction;
- (CLLocationCoordinate2D)centerCoordinate;
@property (nonatomic) MGLAnnotationVerticalAlignment userLocationVerticalAlignment;
@property (nonatomic) UIEdgeInsets contentInset;

@end

@interface RCTMGLAnnotation : NSObject <MGLAnnotation>

@property (nonatomic, strong) UIButton *rightCalloutAccessory;
@property (nonatomic) NSString *id;
@property (nonatomic) NSString *annotationImageURL;
@property (nonatomic) CGSize annotationImageSize;

+ (instancetype)annotationWithLocation:(CLLocationCoordinate2D)coordinate title:(NSString *)title subtitle:(NSString *)subtitle id:(NSString *)id;

+ (instancetype)annotationWithLocationRightCallout:(CLLocationCoordinate2D)coordinate title:(NSString *)title subtitle:(NSString *)subtitle id:(NSString *)id rightCalloutAccessory:(UIButton *)rightCalloutAccessory;

- (instancetype)initWithLocation:(CLLocationCoordinate2D)coordinate title:(NSString *)title subtitle:(NSString *)subtitle id:(NSString *)id;

- (instancetype)initWithLocationRightCallout:(CLLocationCoordinate2D)coordinate title:(NSString *)title subtitle:(NSString *)subtitle id:(NSString *)id rightCalloutAccessory:(UIButton *)rightCalloutAccessory;


@end

@interface RCTMGLAnnotationPolyline : MGLPolyline

@property (nonatomic) NSString *id;
@property (nonatomic) double strokeAlpha;
@property (nonatomic) NSString *strokeColor;
@property (nonatomic) double strokeWidth;
@property (nonatomic) NSString *type;
@property (nonatomic) NSUInteger count;
@property (nonatomic) CLLocationCoordinate2D *coordinates;

+ (instancetype)polylineAnnotation:(CLLocationCoordinate2D *)coordinates strokeAlpha:(double)strokeAlpha strokeColor:(NSString *)strokeColor strokeWidth:(double)strokeWidth id:(NSString *)id type:(NSString *)type count:(NSUInteger)count;

@end

@interface RCTMGLAnnotationPolygon : MGLPolygon

@property (nonatomic) NSString *id;
@property (nonatomic) double fillAlpha;
@property (nonatomic) NSString *fillColor;
@property (nonatomic) double strokeAlpha;
@property (nonatomic) NSString *strokeColor;
@property (nonatomic) NSString *type;
@property (nonatomic) NSUInteger count;
@property (nonatomic) CLLocationCoordinate2D *coordinates;

+ (instancetype)polygonAnnotation:(CLLocationCoordinate2D *)coordinates fillAlpha:(double)fillAlpha fillColor:(NSString *)fillColor  strokeColor:(NSString *)strokeColor strokeAlpha:(double)strokeAlpha id:(NSString *)id type:(NSString *)type count:(NSUInteger)count;

@end
