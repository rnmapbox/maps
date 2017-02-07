//
//  RCTMapboxGL.h
//  RCTMapboxGL
//
//  Created by Bobby Sudekum on 4/30/15.
//  Copyright (c) 2015 Mapbox. All rights reserved.
//

#import <Mapbox/Mapbox.h>
#import <React/RCTView.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTBridgeModule.h>

@interface RCTMapboxGL : RCTView <MGLMapViewDelegate>

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher;

// React props
- (void)setInitialCenterCoordinate:(CLLocationCoordinate2D)centerCoordinate;
- (void)setInitialZoomLevel:(double)zoomLevel;
- (void)setInitialDirection:(double)direction;
- (void)setClipsToBounds:(BOOL)clipsToBounds;
- (void)setDebugActive:(BOOL)debugActive;
- (void)setRotateEnabled:(BOOL)rotateEnabled;
- (void)setScrollEnabled:(BOOL)scrollEnabled;
- (void)setZoomEnabled:(BOOL)zoomEnabled;
- (void)setShowsUserLocation:(BOOL)showsUserLocation;
- (void)setStyleURL:(NSURL *)styleURL;
- (void)setUserTrackingMode:(int)userTrackingMode;
- (void)setAttributionButtonIsHidden:(BOOL)isHidden;
- (void)setLogoIsHidden:(BOOL)isHidden;
- (void)setCompassIsHidden:(BOOL)isHidden;
- (void)setUserLocationVerticalAlignment:(MGLAnnotationVerticalAlignment) aligment;
- (void)setContentInset:(UIEdgeInsets)contentInset;
@property (nonatomic) BOOL annotationsPopUpEnabled;

// Imperative methods
- (void)setCenterCoordinate:(CLLocationCoordinate2D)coordinates zoomLevel:(double)zoomLevel direction:(double)direction animated:(BOOL)animated completionHandler:(void (^)())callback;
- (void)setCamera:(MGLMapCamera *)camera withDuration:(NSTimeInterval)duration animationTimingFunction:(nullable CAMediaTimingFunction *)function completionHandler:(nullable void (^)(void))handler;
- (void)setVisibleCoordinateBounds:(MGLCoordinateBounds)bounds edgePadding:(UIEdgeInsets)padding animated:(BOOL)animated;
- (void)selectAnnotation:(NSString*)selectedId animated:(BOOL)animated;
- (void)deselectAnnotation;
- (nonnull NSArray<id<MGLFeature>> *)visibleFeaturesAtPoint:(CGPoint)point inStyleLayersWithIdentifiers:(nullable NSSet<NSString *> *)styleLayerIdentifiers;
- (nonnull NSArray<id<MGLFeature>> *)visibleFeaturesInRect:(CGRect)rect inStyleLayersWithIdentifiers:(nullable NSSet<NSString *> *)identifiers;

// Annotation management
- (void)upsertAnnotation:(NSObject *)annotation;
- (void)removeAnnotation:(NSString*)selectedIdentifier;
- (void)removeAllAnnotations;
- (void)restoreAnnotationPosition:(NSString *)annotationId;

// Getters
- (MGLCoordinateBounds)visibleCoordinateBounds;
- (double)zoomLevel;
- (double)direction;
- (double)pitch;
- (MGLMapCamera*)camera;
- (CLLocationCoordinate2D)centerCoordinate;

// Events
@property (nonatomic, copy) RCTDirectEventBlock onRegionDidChange;
@property (nonatomic, copy) RCTDirectEventBlock onRegionWillChange;
@property (nonatomic, copy) RCTDirectEventBlock onChangeUserTrackingMode;
@property (nonatomic, copy) RCTDirectEventBlock onOpenAnnotation;
@property (nonatomic, copy) RCTDirectEventBlock onCloseAnnotation;
@property (nonatomic, copy) RCTDirectEventBlock onRightAnnotationTapped;
@property (nonatomic, copy) RCTDirectEventBlock onUpdateUserLocation;
@property (nonatomic, copy) RCTDirectEventBlock onTap;
@property (nonatomic, copy) RCTDirectEventBlock onLongPress;
@property (nonatomic, copy) RCTDirectEventBlock onFinishLoadingMap;
@property (nonatomic, copy) RCTDirectEventBlock onStartLoadingMap;
@property (nonatomic, copy) RCTDirectEventBlock onLocateUserFailed;

@end

@interface RCTMGLAnnotation : NSObject <MGLAnnotation>

@property (nonatomic, strong) UIButton *rightCalloutAccessory;
@property (nonatomic) NSString *id;
@property (nonatomic) NSDictionary *annotationImageSource;
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
