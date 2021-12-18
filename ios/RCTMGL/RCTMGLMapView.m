//
//  RCTMGLMapView.m
//  RCTMGL
//
//  Created by Nick Italiano on 8/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLMapView.h"
#import "CameraUpdateQueue.h"
#import "RCTMGLUtils.h"
#import "RNMBImageUtils.h"
#import "RCTMGLImages.h"
#import <React/UIView+React.h>
#import "RCTMGLNativeUserLocation.h"
#import "RCTMGLLogging.h"

@implementation RCTMGLMapView
{
    BOOL _pendingInitialLayout;
}

static double const DEG2RAD = M_PI / 180;
static double const LAT_MAX = 85.051128779806604;
static double const TILE_SIZE = 256;
static double const EARTH_RADIUS_M = 6378137;
static double const M2PI = M_PI * 2;

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        _pendingInitialLayout = YES;
        _cameraUpdateQueue = [[CameraUpdateQueue alloc] init];
        _sources = [[NSMutableArray alloc] init];
        _images = [[NSMutableArray alloc] init];
        _layers = [[NSMutableArray alloc] init];
        _pointAnnotations = [[NSMutableArray alloc] init];
        _reactSubviews = [[NSMutableArray alloc] init];
        _layerWaiters = [[NSMutableDictionary alloc] init];
        _styleWaiters = [[NSMutableArray alloc] init];
        _logging = [[RCTMGLLogging alloc] init];
    }
    return self;
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    if (_pendingInitialLayout) {
        _pendingInitialLayout = NO;

        [   _reactCamera initialLayout];
    }
}

- (void)invalidate
{
    if (_reactSubviews.count == 0) {
        return;
    }
    for (int i = 0; i < _reactSubviews.count; i++) {
        [self removeFromMap:_reactSubviews[i]];
    }
}

- (void)layerAdded:(MGLStyleLayer*) layer
{
    NSString* layerID = layer.identifier;
    NSMutableArray* waiters = [_layerWaiters valueForKey:layerID];
    if (waiters) {
        for (FoundLayerBlock foundLayerBlock in waiters) {
            foundLayerBlock(layer);
        }
        [_layerWaiters removeObjectForKey:layerID];
    }
}

- (void)waitForLayerWithID:(nonnull NSString*)layerID then:(void (^)(MGLStyleLayer* layer))foundLayer {
    if (self.style) {
        MGLStyleLayer* layer = [self.style layerWithIdentifier:layerID];
        if (layer) {
            foundLayer(layer);
        } else {
            NSMutableArray* existingWaiters = [_layerWaiters valueForKey:layerID];
            
            NSMutableArray* waiters = existingWaiters;
            if (waiters == nil) {
                waiters = [[NSMutableArray alloc] init];
            }
            [waiters addObject:foundLayer];
            if (! existingWaiters) {
                [_layerWaiters setObject:waiters forKey:layerID];
            }
        }
    } else {
        // TODO
    }
}

- (void)getStyle:(void (^)(MGLStyle* style))onStyleLoaded {
    if (self.style) {
        onStyleLoaded(self.style);
    } else {
        [_styleWaiters addObject:onStyleLoaded];
    }
}

- (void)notifyStyleLoaded {
    if (!self.style) return;
    for (StyleLoadedBlock styleLoadedBlock in self.styleWaiters) {
        styleLoadedBlock(self.style);
    }
    [self.styleWaiters removeAllObjects];
}


- (void) addToMap:(id<RCTComponent>)subview
{
    if ([subview isKindOfClass:[RCTMGLSource class]]) {
        RCTMGLSource *source = (RCTMGLSource*)subview;
        source.map = self;
        [_sources addObject:(RCTMGLSource*)subview];
    } else if ([subview isKindOfClass:[RCTMGLLight class]]) {
        RCTMGLLight *light = (RCTMGLLight*)subview;
        _light = light;
        _light.map = self;
    } else if ([subview isKindOfClass:[RCTMGLNativeUserLocation class]]) {
        RCTMGLNativeUserLocation *nativeUserLocation = (RCTMGLNativeUserLocation*)subview;
        nativeUserLocation.map = self;
    }  else if ([subview isKindOfClass:[RCTMGLPointAnnotation class]]) {
        RCTMGLPointAnnotation *pointAnnotation = (RCTMGLPointAnnotation *)subview;
        pointAnnotation.map = self;
        [_pointAnnotations addObject:pointAnnotation];
    } else if ([subview isKindOfClass:[RCTMGLCamera class]]) {
        RCTMGLCamera *camera = (RCTMGLCamera *)subview;
        camera.map = self;
    } else if ([subview isKindOfClass:[RCTMGLImages class]]) {
        RCTMGLImages *images = (RCTMGLImages*)subview;
        images.map = self;
        [_images addObject:images];
    } else if ([subview isKindOfClass:[RCTMGLLayer class]]) {
        RCTMGLLayer *layer = (RCTMGLLayer*)subview;
        layer.map = self;
        [_layers addObject:layer];
    } else {
        NSArray<id<RCTComponent>> *childSubviews = [subview reactSubviews];

        for (int i = 0; i < childSubviews.count; i++) {
            [self addToMap:childSubviews[i]];
        }
    }
}

- (void) removeFromMap:(id<RCTComponent>)subview
{
    if ([subview isKindOfClass:[RCTMGLSource class]]) {
        RCTMGLSource *source = (RCTMGLSource*)subview;
        source.map = nil;
        [_sources removeObject:source];
    } else if ([subview isKindOfClass:[RCTMGLPointAnnotation class]]) {
        RCTMGLPointAnnotation *pointAnnotation = (RCTMGLPointAnnotation *)subview;
        pointAnnotation.map = nil;
        [_pointAnnotations removeObject:pointAnnotation];
    } else if ([subview isKindOfClass:[RCTMGLCamera class]]) {
        RCTMGLCamera *camera = (RCTMGLCamera *)subview;
        camera.map = nil;
    } else if ([subview isKindOfClass:[RCTMGLImages class]]) {
        RCTMGLImages *images = (RCTMGLImages*)subview;
        images.map = nil;
        [_images removeObject:images];
    } else if ([subview isKindOfClass:[RCTMGLLayer class]]) {
        RCTMGLLayer *layer = (RCTMGLLayer*)subview;
        layer.map = nil;
        [_layers removeObject:layer];
    } else if ([subview isKindOfClass:[RCTMGLNativeUserLocation class]]) {
        RCTMGLNativeUserLocation *nativeUserLocation = (RCTMGLNativeUserLocation *)subview;
        nativeUserLocation.map = nil;
    } else if ([subview isKindOfClass:[RCTMGLLight class]]) {
        RCTMGLLight *light = (RCTMGLLight*)subview;
        light.map = nil;
    }  else {
        NSArray<id<RCTComponent>> *childSubViews = [subview reactSubviews];
        
        for (int i = 0; i < childSubViews.count; i++) {
            [self removeFromMap:childSubViews[i]];
        }
    }
    if ([_layerWaiters count] > 0) {
        RCTLogWarn(@"The following layers were waited on but never added to the map: %@", [_layerWaiters allKeys]);
        [_layerWaiters removeAllObjects];
    }
}

- (void)setSourceVisibility:(BOOL)visible sourceId:(NSString *)sourceId sourceLayerId:(NSString *)sourceLayerId {
    __weak typeof(self) weakSelf = self;
    [self getStyle:^(MGLStyle *style) {
        __strong typeof(self) strongSelf = weakSelf;
        for (MGLStyleLayer *layer in strongSelf.style.layers) {
            if ([layer isKindOfClass:[MGLForegroundStyleLayer class]]) {
                MGLForegroundStyleLayer *foregroundLayer = (MGLForegroundStyleLayer*)layer;
                if (![foregroundLayer.sourceIdentifier isEqualToString:sourceId]) continue;
                if (sourceLayerId == nil || sourceLayerId.length == 0) {
                    layer.visible = visible;
                } else if ([layer isKindOfClass:[MGLVectorStyleLayer class]]) {
                    MGLVectorStyleLayer *vectorLayer = (MGLVectorStyleLayer*)layer;
                    if ([vectorLayer.sourceLayerIdentifier isEqualToString:sourceLayerId]) {
                        layer.visible = visible;
                    }
                }
            }
        }
    }];
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)insertReactSubview:(id<RCTComponent>)subview atIndex:(NSInteger)atIndex {
    [self addToMap:subview];
    [_reactSubviews insertObject:(UIView *)subview atIndex:(NSUInteger) atIndex];
}
#pragma clang diagnostic pop

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)removeReactSubview:(id<RCTComponent>)subview {
    // similarly, when the children are being removed we have to do the appropriate
    // underlying mapview action here.
    [self removeFromMap:subview];
    [_reactSubviews removeObject:(UIView *)subview];
    [(UIView *)subview removeFromSuperview];
}
#pragma clang diagnostic pop

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (NSArray<id<RCTComponent>> *)reactSubviews {
    return _reactSubviews;
}
#pragma clang diagnostic pop

- (void)setReactZoomEnabled:(BOOL)reactZoomEnabled
{
    _reactZoomEnabled = reactZoomEnabled;
    self.zoomEnabled = _reactZoomEnabled;
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

- (void)setReactRotateEnabled:(BOOL)reactRotateEnabled
{
    _reactRotateEnabled = reactRotateEnabled;
    self.rotateEnabled = _reactRotateEnabled;
}

- (void)setReactAttributionEnabled:(BOOL)reactAttributionEnabled
{
    _reactAttributionEnabled = reactAttributionEnabled;
    self.attributionButton.hidden = !_reactAttributionEnabled;
    
}

- (void)setReactAttributionPosition:(NSDictionary<NSString *,NSNumber *> *)position
{
    NSNumber *left   = [position valueForKey:@"left"];
    NSNumber *right  = [position valueForKey:@"right"];
    NSNumber *top    = [position valueForKey:@"top"];
    NSNumber *bottom = [position valueForKey:@"bottom"];
    if (left != nil && top != nil) {
        [self setAttributionButtonPosition:MGLOrnamentPositionTopLeft];
        [self setAttributionButtonMargins:CGPointMake([left floatValue], [top floatValue])];
    } else if (right != nil && top != nil) {
        [self setAttributionButtonPosition:MGLOrnamentPositionTopRight];
        [self setAttributionButtonMargins:CGPointMake([right floatValue], [top floatValue])];
    } else if (bottom != nil && right != nil) {
        [self setAttributionButtonPosition:MGLOrnamentPositionBottomRight];
        [self setAttributionButtonMargins:CGPointMake([right floatValue], [bottom floatValue])];
    } else if (bottom != nil && left != nil) {
        [self setAttributionButtonPosition:MGLOrnamentPositionBottomLeft];
        [self setAttributionButtonMargins:CGPointMake([left floatValue], [bottom floatValue])];
    } else {
        [self setAttributionButtonPosition:MGLOrnamentPositionBottomRight];
        // same as MGLOrnamentDefaultPositionOffset in MGLMapView.mm
        [self setAttributionButtonMargins:CGPointMake(8, 8)];
    }
    
}

- (void)setReactLogoEnabled:(BOOL)reactLogoEnabled
{
    _reactLogoEnabled = reactLogoEnabled;
    self.logoView.hidden = !_reactLogoEnabled;
}

- (void)setReactLogoPosition:(NSDictionary<NSString *,NSNumber *> *)logoPosition
{
    NSNumber *left   = [logoPosition valueForKey:@"left"];
    NSNumber *right  = [logoPosition valueForKey:@"right"];
    NSNumber *top    = [logoPosition valueForKey:@"top"];
    NSNumber *bottom = [logoPosition valueForKey:@"bottom"];
    if (left != nil && top != nil) {
        [self setLogoViewPosition:MGLOrnamentPositionTopLeft];
        [self setLogoViewMargins:CGPointMake([left floatValue], [top floatValue])];
    } else if (right != nil && top != nil) {
        [self setLogoViewPosition:MGLOrnamentPositionTopRight];
        [self setLogoViewMargins:CGPointMake([right floatValue], [top floatValue])];
    } else if (bottom != nil && right != nil) {
        [self setLogoViewPosition:MGLOrnamentPositionBottomRight];
        [self setLogoViewMargins:CGPointMake([right floatValue], [bottom floatValue])];
    } else if (bottom != nil && left != nil) {
        [self setLogoViewPosition:MGLOrnamentPositionBottomLeft];
        [self setLogoViewMargins:CGPointMake([left floatValue], [bottom floatValue])];
    } else {
        [self setLogoViewPosition:MGLOrnamentPositionBottomRight];
        [self setLogoViewMargins:CGPointMake(8, 8)];
    }

}

- (void)setReactCompassEnabled:(BOOL)reactCompassEnabled
{
    _reactCompassEnabled = reactCompassEnabled;
    self.compassView.hidden = !_reactCompassEnabled;
}

- (void)setReactCompassViewPosition:(NSInteger *)reactCompassViewPosition
{
    if(!self.compassView.hidden)
    {
        _reactCompassViewPosition = reactCompassViewPosition;
        self.compassViewPosition = _reactCompassViewPosition;
    }
}

- (void)setReactCompassViewMargins:(CGPoint)reactCompassViewMargins
{
    if(!self.compassView.hidden)
    {
        CGPoint point;
        point = reactCompassViewMargins;
        self.compassViewMargins = point;
    }
}

- (void)setReactShowUserLocation:(BOOL)reactShowUserLocation
{
    // FMTODO
    //_reactShowUserLocation = reactShowUserLocation;
    self.showsUserLocation = reactShowUserLocation; //_reactShowUserLocation;
}

- (void)setReactContentInset:(NSArray<NSNumber *> *)reactContentInset
{
    CGFloat top = 0.0f, right = 0.0f, left = 0.0f, bottom = 0.0f;
    
    if (reactContentInset.count == 4) {
        top = [reactContentInset[0] floatValue];
        right = [reactContentInset[1] floatValue];
        bottom = [reactContentInset[2] floatValue];
        left = [reactContentInset[3] floatValue];
    } else if (reactContentInset.count == 2) {
        top = [reactContentInset[0] floatValue];
        right = [reactContentInset[1] floatValue];
        bottom = [reactContentInset[0] floatValue];
        left = [reactContentInset[1] floatValue];
    } else if (reactContentInset.count == 1) {
        top = [reactContentInset[0] floatValue];
        right = [reactContentInset[0] floatValue];
        bottom = [reactContentInset[0] floatValue];
        left = [reactContentInset[0] floatValue];
    }
    
    self.contentInset = UIEdgeInsetsMake(top, left, bottom, right);
}

- (void)setReactStyleURL:(NSString *)reactStyleURL
{
    _reactStyleURL = reactStyleURL;
    [self _removeAllSourcesFromMap];
    self.styleURL = [self _getStyleURLFromKey:_reactStyleURL];
}

- (void)setReactPreferredFramesPerSecond:(NSInteger)reactPreferredFramesPerSecond
{    
    self.preferredFramesPerSecond = reactPreferredFramesPerSecond;
}


#pragma mark - methods

- (NSString *)takeSnap:(BOOL)writeToDisk
{
    UIGraphicsBeginImageContextWithOptions(self.bounds.size, YES, 0);
    [self drawViewHierarchyInRect:self.bounds afterScreenUpdates:YES];
    UIImage *snapshot = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return writeToDisk ? [RNMBImageUtils createTempFile:snapshot] : [RNMBImageUtils createBase64:snapshot];
}

- (CLLocationDistance)getMetersPerPixelAtLatitude:(double)latitude withZoom:(double)zoomLevel
{
    double constrainedZoom = [[RCTMGLUtils clamp:[NSNumber numberWithDouble:zoomLevel]
                                             min:[NSNumber numberWithDouble:self.minimumZoomLevel]
                                             max:[NSNumber numberWithDouble:self.maximumZoomLevel]] doubleValue];
    
    double constrainedLatitude = [[RCTMGLUtils clamp:[NSNumber numberWithDouble:latitude]
                                                 min:[NSNumber numberWithDouble:-LAT_MAX]
                                                 max:[NSNumber numberWithDouble:LAT_MAX]] doubleValue];
    
    double constrainedScale = pow(2.0, constrainedZoom);
    return cos(constrainedLatitude * DEG2RAD) * M2PI * EARTH_RADIUS_M / (constrainedScale * TILE_SIZE);
}

- (CLLocationDistance)altitudeFromZoom:(double)zoomLevel
{
    return [self altitudeFromZoom:zoomLevel atLatitude:self.camera.centerCoordinate.latitude];
}

- (CLLocationDistance)altitudeFromZoom:(double)zoomLevel atLatitude:(CLLocationDegrees)latitude
{
    return [self altitudeFromZoom:zoomLevel atLatitude:latitude atPitch:self.camera.pitch];
}

- (CLLocationDistance)altitudeFromZoom:(double)zoomLevel atLatitude:(CLLocationDegrees)latitude atPitch:(CGFloat)pitch
{
    return MGLAltitudeForZoomLevel(zoomLevel, pitch, latitude, self.frame.size);
}

- (RCTMGLPointAnnotation*)getRCTPointAnnotation:(MGLPointAnnotation *)mglAnnotation
{
    for (int i = 0; i < _pointAnnotations.count; i++) {
        RCTMGLPointAnnotation *rctAnnotation = _pointAnnotations[i];
        if (rctAnnotation.annotation == mglAnnotation) {
            return rctAnnotation;
        }
    }
    return nil;
}

- (NSArray<RCTMGLSource *> *)getAllTouchableSources
{
    NSMutableArray<RCTMGLSource *> *touchableSources = [[NSMutableArray alloc] init];
    
    for (RCTMGLSource *source in _sources) {
        if (source.hasPressListener) {
            [touchableSources addObject:source];
        }
    }
    
    return touchableSources;
}

- (NSArray<RCTMGLImages*>*)getAllImages
{
    return [_images copy];
}

- (NSArray<RCTMGLShapeSource *> *)getAllShapeSources
{
    NSMutableArray<RCTMGLSource *> *shapeSources = [[NSMutableArray alloc] init];
    
    for (RCTMGLSource *source in _sources) {
        if ([source isKindOfClass:[RCTMGLShapeSource class]]) {
            [shapeSources addObject:source];
        }
    }
    
    return shapeSources;
}
- (RCTMGLSource *)getTouchableSourceWithHighestZIndex:(NSArray<RCTMGLSource *> *)touchableSources
{
    if (touchableSources == nil || touchableSources.count == 0) {
        return nil;
    }
    
    if (touchableSources.count == 1) {
        return touchableSources[0];
    }
    
    NSMutableDictionary<NSString *, RCTMGLSource *> *layerToSoureDict = [[NSMutableDictionary alloc] init];
    for (RCTMGLSource *touchableSource in touchableSources) {
        NSArray<NSString *> *layerIDs = [touchableSource getLayerIDs];
        
        for (NSString *layerID in layerIDs) {
            layerToSoureDict[layerID] = touchableSource;
        }
    }
    
    NSArray<MGLStyleLayer *> *layers = self.style.layers;
    for (int i = (int)layers.count - 1; i >= 0; i--) {
        MGLStyleLayer *layer = layers[i];
        
        RCTMGLSource *source = layerToSoureDict[layer.identifier];
        if (source != nil) {
            return source;
        }
    }
    
    return nil;
}

- (NSURL*)_getStyleURLFromKey:(NSString *)styleURL
{
    NSURL *url = [NSURL URLWithString:styleURL];
    if (url) {
        return url;
    } else if (RCTJSONParse(styleURL, nil)) {
        return [RCTMGLUtils styleURLFromStyleJSON:styleURL];
    }
    return url;
}

- (void)_removeAllSourcesFromMap
{
    if (self.style == nil || _sources.count == 0) {
        return;
    }
    for (RCTMGLSource *source in _sources) {
        source.map = nil;
    }
}

- (void)didChangeUserTrackingMode:(MGLUserTrackingMode)mode animated:(BOOL)animated {
    [_reactCamera didChangeUserTrackingMode:mode animated:animated];
}

@end
