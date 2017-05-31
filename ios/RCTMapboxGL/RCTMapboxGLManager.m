//
//  RCTMapboxGLManager.m
//  RCTMapboxGL
//
//  Created by Bobby Sudekum on 4/30/15.
//  Copyright (c) 2015 Mapbox. All rights reserved.
//

#import "RCTMapboxGLManager.h"
#import "RCTMapboxGL.h"
#import <Mapbox/Mapbox.h>
#import <React/RCTConvert+CoreLocation.h>
#import <React/RCTConvert.h>
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>
#import <React/UIView+React.h>
#import <React/RCTUIManager.h>
#import "RCTMapboxGLConversions.h"
#import "MGLPolygon+RCTAdditions.h"
#import "MGLPolyline+RCTAdditions.h"

@implementation RCTMapboxGLManager

- (UIView *)view
{
    return [[RCTMapboxGL alloc] initWithEventDispatcher:self.bridge.eventDispatcher];
}

@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
    return _bridge.uiManager.methodQueue;
}

RCT_EXPORT_MODULE();

// Props

RCT_EXPORT_VIEW_PROPERTY(initialCenterCoordinate, CLLocationCoordinate2D);
RCT_EXPORT_VIEW_PROPERTY(initialZoomLevel, double);
RCT_EXPORT_VIEW_PROPERTY(initialDirection, double);
RCT_EXPORT_VIEW_PROPERTY(clipsToBounds, BOOL);
RCT_EXPORT_VIEW_PROPERTY(debugActive, BOOL);
RCT_EXPORT_VIEW_PROPERTY(rotateEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(zoomEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(minimumZoomLevel, double);
RCT_EXPORT_VIEW_PROPERTY(maximumZoomLevel, double);
RCT_EXPORT_VIEW_PROPERTY(pitchEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(showsUserLocation, BOOL);
RCT_EXPORT_VIEW_PROPERTY(styleURL, NSURL);
RCT_EXPORT_VIEW_PROPERTY(userTrackingMode, int);
RCT_EXPORT_VIEW_PROPERTY(attributionButtonIsHidden, BOOL);
RCT_EXPORT_VIEW_PROPERTY(logoIsHidden, BOOL);
RCT_EXPORT_VIEW_PROPERTY(compassIsHidden, BOOL);
RCT_EXPORT_VIEW_PROPERTY(userLocationVerticalAlignment, int);
RCT_EXPORT_VIEW_PROPERTY(annotationsPopUpEnabled, BOOL);

RCT_EXPORT_VIEW_PROPERTY(onRegionDidChange, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onRegionWillChange, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onChangeUserTrackingMode, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onOpenAnnotation, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onCloseAnnotation, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onRightAnnotationTapped, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onUpdateUserLocation, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onTap, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onLongPress, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onFinishLoadingMap, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onStartLoadingMap, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onLocateUserFailed, RCTDirectEventBlock);

RCT_CUSTOM_VIEW_PROPERTY(contentInset, UIEdgeInsetsMake, RCTMapboxGL)
{
    int top = [json[0] doubleValue];
    int left = [json[3] doubleValue];
    int bottom = [json[2] doubleValue];
    int right = [json[1] doubleValue];
    UIEdgeInsets inset = UIEdgeInsetsMake(top, left, bottom, right);
    view.contentInset = inset;
}

// Constants

- (NSDictionary *)constantsToExport
{
    return @{
             @"mapStyles": @{
                     @"light": [[MGLStyle lightStyleURL] absoluteString],
                     @"dark": [[MGLStyle darkStyleURL] absoluteString],
                     @"streets": [[MGLStyle streetsStyleURL] absoluteString],
                     @"emerald": [[MGLStyle emeraldStyleURL] absoluteString],
                     @"satellite": [[MGLStyle satelliteStyleURL] absoluteString],
                     @"hybrid": [[MGLStyle hybridStyleURL] absoluteString],
                     },
             @"userTrackingMode": @{
                     @"none": [NSNumber numberWithUnsignedInt:MGLUserTrackingModeNone],
                     @"follow": [NSNumber numberWithUnsignedInt:MGLUserTrackingModeFollow],
                     @"followWithCourse": [NSNumber numberWithUnsignedInt:MGLUserTrackingModeFollowWithCourse],
                     @"followWithHeading": [NSNumber numberWithUnsignedInt:MGLUserTrackingModeFollowWithHeading]
                     },
             @"userLocationVerticalAlignment" : @{
                     @"top": @(MGLAnnotationVerticalAlignmentTop),
                     @"center": @(MGLAnnotationVerticalAlignmentCenter),
                     @"bottom": @(MGLAnnotationVerticalAlignmentBottom)
                     },
             @"unknownResourceCount": @(UINT64_MAX),
             @"metricsEnabled": @([RCTMapboxGLManager metricsEnabled])
             };
};

// Metrics

+ (BOOL)metricsEnabled
{
    NSUserDefaults * ud = [NSUserDefaults standardUserDefaults];
    NSNumber * nr = [ud valueForKey:@"MGLMapboxMetricsEnabled"];
    if (!nr || ![nr isKindOfClass:[NSNumber class]]) {
        return YES;
    }
    return nr.boolValue;
}

RCT_EXPORT_METHOD(setMetricsEnabled:(BOOL)enabled)
{
    [[NSUserDefaults standardUserDefaults] setBool:enabled forKey:@"MGLMapboxMetricsEnabled"];
}

// Access token

RCT_EXPORT_METHOD(setAccessToken:(nonnull NSString *)accessToken)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        if (!accessToken || ![accessToken length] || [accessToken isEqual:@"your-mapbox.com-access-token"]) {
            return;
        }
        [MGLAccountManager setAccessToken:accessToken];
    });
}

// Offline

- (id)init
{
    if (!(self = [super init])) { return nil; }
    
    _recentPacks = [NSMutableSet new];
    _throttledPacks = [NSMutableSet new];
    _removedPacks = [NSMutableSet new];
    _throttleInterval = 300;
    
    _loadingPacks = [NSMutableSet new];
    _loadedPacks = NO;
    
    // Setup pack array loading notifications
    [[MGLOfflineStorage sharedOfflineStorage] addObserver:self forKeyPath:@"packs" options:NSKeyValueObservingOptionInitial context:NULL];
    _packRequests = [NSMutableArray new];
    
    // Setup offline pack notification handlers.
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(offlinePackProgressDidChange:) name:MGLOfflinePackProgressChangedNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(offlinePackDidReceiveError:) name:MGLOfflinePackErrorNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(offlinePackDidReceiveMaximumAllowedMapboxTiles:) name:MGLOfflinePackMaximumMapboxTilesReachedNotification object:nil];
    
    return self;
}

- (void)dealloc
{
    [[MGLOfflineStorage sharedOfflineStorage] removeObserver:self forKeyPath:@"packs"];
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)offlinePacksDidFinishLoading
{
    _loadedPacks = YES;
    
    NSArray * packs = [MGLOfflineStorage sharedOfflineStorage].packs;
    
    if ([_packRequests count]) {
        NSArray * callbackArray = [self serializePacksArray:packs];
        for (RCTPromiseResolveBlock callback in _packRequests) {
            callback(callbackArray);
        }
        [_packRequests removeAllObjects];
    }
    
    for (MGLOfflinePack * pack in packs) {
        [pack resume];
    }
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary *)change
                       context:(void *)context
{
    NSNumber * changeKind = change[NSKeyValueChangeKindKey];
    if (changeKind == [NSNull null]) { return; }
    if ([changeKind integerValue] != NSKeyValueChangeSetting) { return; }
    
    NSArray * packs = [[MGLOfflineStorage sharedOfflineStorage] packs];
    
    if (!packs) { return; }
    if (_loadedPacks) { return; }
    
    [_loadingPacks addObjectsFromArray:packs];
    
    for (MGLOfflinePack * pack in packs) {
        [pack requestProgress];
    }
    
    if (!packs.count) {
        [self offlinePacksDidFinishLoading];
    }
}

- (void)firePackProgress:(MGLOfflinePack*)pack {
    NSDictionary *userInfo = [NSKeyedUnarchiver unarchiveObjectWithData:pack.context];
    MGLOfflinePackProgress progress = pack.progress;
    
    NSDictionary *event = @{ @"name": userInfo[@"name"],
                             @"metadata": userInfo[@"metadata"],
                             @"countOfResourcesCompleted": @(progress.countOfResourcesCompleted),
                             @"countOfResourcesExpected": @(progress.countOfResourcesExpected),
                             @"countOfBytesCompleted": @(progress.countOfBytesCompleted),
                             @"maximumResourcesExpected": @(progress.maximumResourcesExpected) };
    
    [_bridge.eventDispatcher sendAppEventWithName:@"MapboxOfflineProgressDidChange" body:event];
    
    [_recentPacks addObject:pack];
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, _throttleInterval * NSEC_PER_MSEC), dispatch_get_main_queue(), ^{
        [_recentPacks removeObject:pack];
        if ([_throttledPacks containsObject:pack]) {
            [_throttledPacks removeObject:pack];
            [self firePackProgress:pack];
        }
    });
}

- (void)flushThrottleForPack:(MGLOfflinePack*)pack {
    if ([_throttledPacks containsObject:pack]) {
        [_throttledPacks removeObject:pack];
        [self firePackProgress:pack];
    }
}

- (void)discardThrottleForPack:(MGLOfflinePack*)pack {
    if ([_throttledPacks containsObject:pack]) {
        [_throttledPacks removeObject:pack];
    }
}

- (void)offlinePackProgressDidChange:(NSNotification *)notification {
    MGLOfflinePack *pack = notification.object;
    
    if (!_loadedPacks && [_loadingPacks containsObject:pack]) {
        [_loadingPacks removeObject:pack];
        if ([_loadingPacks count] == 0) {
            [self offlinePacksDidFinishLoading];
        }
    }
    
    if ([_removedPacks containsObject:pack]) {
        return;
    }
    
    if ([_recentPacks containsObject:pack]) {
        [_throttledPacks addObject:pack];
        return;
    }
    
    [self firePackProgress:pack];
}

- (void)offlinePackDidReceiveMaximumAllowedMapboxTiles:(NSNotification *)notification {
    MGLOfflinePack *pack = notification.object;
    [self flushThrottleForPack:pack];
    NSDictionary *userInfo = [NSKeyedUnarchiver unarchiveObjectWithData:pack.context];
    uint64_t maximumCount = [notification.userInfo[MGLOfflinePackMaximumCountUserInfoKey] unsignedLongLongValue];
    
    NSDictionary *event = @{ @"name": userInfo[@"name"],
                             @"maxTiles": @(maximumCount) };
    
    [_bridge.eventDispatcher sendAppEventWithName:@"MapboxOfflineMaxAllowedTiles" body:event];
}

- (void)offlinePackDidReceiveError:(NSNotification *)notification {
    MGLOfflinePack *pack = notification.object;
    [self flushThrottleForPack:pack];
    NSDictionary *userInfo = [NSKeyedUnarchiver unarchiveObjectWithData:pack.context];
    NSError *error = notification.userInfo[MGLOfflinePackErrorUserInfoKey];
    
    NSDictionary *event = @{ @"name": userInfo[@"name"],
                             @"error": [error localizedDescription] };
    
    [_bridge.eventDispatcher sendAppEventWithName:@"MapboxOfflineError" body:event];
}

RCT_REMAP_METHOD(addOfflinePack,
                 pack:(NSDictionary*)options
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    if (options[@"name"] == nil) {
        reject(@"invalid_arguments", @"addOfflinePack(): name is required.", nil);
        return;
    }
    if (options[@"minZoomLevel"] == nil) {
        reject(@"invalid_arguments", @"addOfflinePack(): minZoomLevel is required.", nil);
        return;
    }
    if (options[@"maxZoomLevel"] == nil) {
        reject(@"invalid_arguments", @"addOfflinePack(): maxZoomLevel is required.", nil);
        return;
    }
    if (options[@"bounds"] == nil) {
        reject(@"invalid_arguments", @"addOfflinePack(): bounds is required.", nil);
        return;
    }
    if (options[@"styleURL"] == nil) {
        reject(@"invalid_arguments", @"addOfflinePack(): styleURL is required.", nil);
        return;
    }
    if (!([options[@"type"] isEqualToString:@"bbox"])) {
        reject(@"invalid_arguments",
               [NSString stringWithFormat:@"addOfflinePack(): Offline type %@ not supported. Only type \"bbox\" supported.", options[@"type"]]
               , nil);
        return;
    }
    
    NSArray *b = [options valueForKey:@"bounds"];
    MGLCoordinateBounds bounds = MGLCoordinateBoundsMake(CLLocationCoordinate2DMake([b[0] floatValue], [b[1] floatValue]), CLLocationCoordinate2DMake([b[2] floatValue], [b[3] floatValue]));
    
    NSURL * styleURL = [NSURL URLWithString:[options valueForKey:@"styleURL"]];
    float fromZoomLevel = [[options valueForKey:@"minZoomLevel"] floatValue];
    float toZoomLevel = [[options valueForKey:@"maxZoomLevel"] floatValue];
    NSString * name = [options valueForKey:@"name"];
    NSString * type = [options valueForKey:@"type"];
    NSDictionary * metadata = [options valueForKey:@"metadata"];
    
    dispatch_async(dispatch_get_main_queue(), ^{
        id <MGLOfflineRegion> region = [[MGLTilePyramidOfflineRegion alloc] initWithStyleURL:styleURL bounds:bounds fromZoomLevel:fromZoomLevel toZoomLevel:toZoomLevel];
        
        NSMutableDictionary *userInfo = @{ @"name": name,
                                           @"metadata": metadata ? metadata : [NSNull null] };
        NSData *context = [NSKeyedArchiver archivedDataWithRootObject:userInfo];
        
        [[MGLOfflineStorage sharedOfflineStorage] addPackForRegion:region withContext:context completionHandler:^(MGLOfflinePack *pack, NSError *error) {
            if (error != nil) {
                reject(@"add_pack_failed", error.localizedFailureReason, error);
            } else {
                [pack resume];
                resolve([NSNull null]);
            }
        }];
    });
}

- (NSArray*)serializePacksArray:(NSArray<MGLOfflinePack*>*)packs
{
    NSMutableArray* callbackArray = [NSMutableArray new];
    
    for (MGLOfflinePack *pack in packs) {
        NSMutableDictionary *userInfo = [NSKeyedUnarchiver unarchiveObjectWithData:pack.context];
        [callbackArray addObject:@{ @"name": userInfo[@"name"],
                                    @"metadata": userInfo[@"metadata"],
                                    @"countOfBytesCompleted": @(pack.progress.countOfBytesCompleted),
                                    @"countOfResourcesCompleted": @(pack.progress.countOfResourcesCompleted),
                                    @"countOfResourcesExpected": @(pack.progress.countOfResourcesExpected),
                                    @"maximumResourcesExpected": @(pack.progress.maximumResourcesExpected) }];
    }
    
    return callbackArray;
}

RCT_REMAP_METHOD(getOfflinePacks,
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        NSMutableArray* callbackArray = [NSMutableArray new];
        
        if (!_loadedPacks) {
            [_packRequests addObject:resolve];
        } else {
            MGLOfflinePack *packs = [MGLOfflineStorage sharedOfflineStorage].packs;
            resolve([self serializePacksArray:packs]);
        }
    });
}

RCT_REMAP_METHOD(removeOfflinePack,
                 name:(NSString*)packName
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        MGLOfflinePack *packs = [MGLOfflineStorage sharedOfflineStorage].packs;
        MGLOfflinePack *tempPack;
        
        for (MGLOfflinePack *pack in packs) {
            NSDictionary *userInfo = [NSKeyedUnarchiver unarchiveObjectWithData:pack.context];
            if ([packName isEqualToString:userInfo[@"name"]]) {
                tempPack = pack;
                break;
            }
        }
        
        if (tempPack == nil) {
            return resolve(@{});
        }
        
        NSDictionary *userInfo = [NSKeyedUnarchiver unarchiveObjectWithData:tempPack.context];
        
        
        // Workaround for https://github.com/mapbox/mapbox-gl-native/issues/5508
        
        [_removedPacks addObject:tempPack];
        [self discardThrottleForPack:tempPack];
        [tempPack suspend];
        
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 100 * NSEC_PER_MSEC), dispatch_get_main_queue(), ^{
            [_removedPacks removeObject:tempPack];
            [[MGLOfflineStorage sharedOfflineStorage] removePack:tempPack withCompletionHandler:^(NSError * _Nullable error) {
                if (error != nil) {
                    reject(@"remove_pack_failed", error.localizedFailureReason, error);
                } else {
                    resolve(@{ @"deleted": userInfo[@"name"] });
                }
            }];
        });
    });
}

RCT_EXPORT_METHOD(setOfflinePackProgressThrottleInterval:(nonnull NSNumber *)milis)
{
    _throttleInterval = [milis intValue];
}

// View methods

RCT_EXPORT_METHOD(spliceAnnotations:(nonnull NSNumber *)reactTag
                  deleteAll:(BOOL)deleteAll
                  toDelete:(nonnull NSArray<NSString *> *)toDelete
                  toAdd:(nonnull NSArray *)toAdd)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        
        if (deleteAll) {
            [mapView removeAllAnnotations];
        } else {
            for (NSString * key in toDelete) {
                [mapView removeAnnotation:key];
            }
        }
        
        for (NSObject * annotationObject in toAdd) {
            [mapView upsertAnnotation:convertToMGLAnnotation(annotationObject)];
        }
    }];
}

RCT_EXPORT_METHOD(getCenterCoordinateZoomLevel:(nonnull NSNumber *)reactTag
                  callback:(RCTResponseSenderBlock)callback)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        CLLocationCoordinate2D region = [mapView centerCoordinate];
        double zoom = [mapView zoomLevel];
        
        callback(@[ @{ @"latitude": @(region.latitude),
                       @"longitude": @(region.longitude),
                       @"zoomLevel": @(zoom) } ]);
    }];
}

RCT_EXPORT_METHOD(getBounds:(nonnull NSNumber *)reactTag
                  callback:(RCTResponseSenderBlock)callback)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        MGLCoordinateBounds bounds = [mapView visibleCoordinateBounds];
        NSMutableArray *callbackArray = [[NSMutableArray alloc] init];
        
        [callbackArray addObject:@(bounds.sw.latitude)];
        [callbackArray addObject:@(bounds.sw.longitude)];
        [callbackArray addObject:@(bounds.ne.latitude)];
        [callbackArray addObject:@(bounds.ne.longitude)];
        
        callback(@[callbackArray]);
    }];
}

RCT_EXPORT_METHOD(getDirection:(nonnull NSNumber *)reactTag
                  callback:(RCTResponseSenderBlock)callback)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        double direction = [mapView direction];
        
        callback(@[ @(direction) ]);
    }];
}

RCT_EXPORT_METHOD(getPitch:(nonnull NSNumber *)reactTag
                  callback:(RCTResponseSenderBlock)callback)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        double pitch = [mapView pitch];
        
        callback(@[ @(pitch) ]);
    }];
}

RCT_EXPORT_METHOD(easeTo:(nonnull NSNumber *)reactTag
                  options:(NSDictionary *)options
                  animated:(BOOL)animated
                  callback:(RCTResponseSenderBlock)callback)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            
            NSNumber * latitude = options[@"latitude"];
            NSNumber * longitude = options[@"longitude"];
            NSNumber * zoom = options[@"zoomLevel"];
            NSNumber * direction = options[@"direction"];
            NSNumber * pitch = options[@"pitch"];
            NSNumber * altitude = options[@"altitude"];
            
            if (pitch && zoom) {
                RCTLogError(@"Pitch and zoomLevel can't be set together with MapView.easeTo() on iOS. Use altitude instead of zoomLevel");
                return;
            }
            
            if (zoom && altitude) {
                RCTLogError(@"Altitude and zoomLevel are mutually exclusive with MapView.easeTo()");
                return;
            }
            
            CLLocationCoordinate2D _center = (latitude && longitude)
            ? CLLocationCoordinate2DMake([latitude doubleValue], [longitude doubleValue])
            : mapView.centerCoordinate;
            
            double _direction = direction ? [direction doubleValue] : mapView.direction;
            
            if (pitch || altitude) {
                MGLMapCamera * oldCamera = (!pitch || !altitude) ? mapView.camera : nil;
                double _altitude = altitude ? [altitude doubleValue] : oldCamera ? oldCamera.altitude : 0;
                double _pitch = pitch ? [pitch doubleValue] : oldCamera ? oldCamera.pitch : 0;
                
                MGLMapCamera *camera = [MGLMapCamera cameraLookingAtCenterCoordinate:_center
                                                                        fromDistance:_altitude
                                                                               pitch:_pitch
                                                                             heading:_direction];
                
                [mapView setCamera: camera
                      withDuration: 0.3
           animationTimingFunction: [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut]
                 completionHandler: ^{
                     callback(@[[NSNull null]]);
                 }];
                
            } else {
                double _zoomLevel = zoom ? [zoom doubleValue] : mapView.zoomLevel;
                
                [mapView setCenterCoordinate: _center
                                   zoomLevel: _zoomLevel
                                   direction: _direction
                                    animated: animated
                           completionHandler: ^{
                               callback(@[[NSNull null]]);
                           }];
            }
        }
    }];
}

RCT_EXPORT_METHOD(setVisibleCoordinateBounds:(nonnull NSNumber *)reactTag
                  latitudeSW:(float) latitudeSW
                  longitudeSW:(float) longitudeSW
                  latitudeNE:(float) latitudeNE
                  longitudeNE:(float) longitudeNE
                  paddingTop:(double) paddingTop
                  paddingRight:(double) paddingRight
                  paddingBottom:(double) paddingBottom
                  paddingLeft:(double) paddingLeft
                  animated:(BOOL) animated)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            MGLCoordinateBounds coordinatesBounds = MGLCoordinateBoundsMake(CLLocationCoordinate2DMake(latitudeSW, longitudeSW), CLLocationCoordinate2DMake(latitudeNE, longitudeNE));
            [mapView setVisibleCoordinateBounds:coordinatesBounds edgePadding:UIEdgeInsetsMake(paddingTop, paddingLeft, paddingBottom, paddingRight) animated:animated];
        }
    }];
}

RCT_EXPORT_METHOD(selectAnnotation:(nonnull NSNumber *) reactTag
                  selectedIdentifier:(NSString*)selectedIdentifier
                  animated:(BOOL)animated)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView selectAnnotation:selectedIdentifier animated:animated];
        }
    }];
}


RCT_EXPORT_METHOD(deselectAnnotation:(nonnull NSNumber *) reactTag)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView deselectAnnotation];
        }
    }];
}

RCT_EXPORT_METHOD(queryRenderedFeatures:(nonnull NSNumber *)reactTag
                  options:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            NSDictionary *pointDict = options[@"point"];
            NSDictionary *rectDict = options[@"rect"];
            if ((!pointDict && !rectDict) || (pointDict && rectDict)) {
                reject(@"invalid_arguments", @"queryRenderedFeatures(): one of 'point' or 'rect' is required.", nil);
                return;
            }

            NSArray<id<MGLFeature>> *features;
            NSArray<NSString *> *styleLayerIdentifiersArray = options[@"layers"];
            NSSet<NSString *> *styleLayerIdentifiers;
            if (styleLayerIdentifiersArray) {
                styleLayerIdentifiers = [NSSet setWithArray:styleLayerIdentifiersArray];
            }

            if (pointDict) {
                NSNumber *screenCoordX = pointDict[@"screenCoordX"];
                NSNumber *screenCoordY = pointDict[@"screenCoordY"];
                CGPoint point = CGPointMake(screenCoordX.floatValue, screenCoordY.floatValue);
                features = [mapView visibleFeaturesAtPoint:point inStyleLayersWithIdentifiers:styleLayerIdentifiers];
            } else {
                NSNumber *left = rectDict[@"left"];
                NSNumber *top = rectDict[@"top"];
                NSNumber *right = rectDict[@"right"];
                NSNumber *bottom = rectDict[@"bottom"];
                CGFloat width = right.floatValue - left.floatValue;
                CGFloat height = bottom.floatValue - top.floatValue;
                CGRect rect = CGRectMake(left.floatValue, top.floatValue, width, height);
                features = [mapView visibleFeaturesInRect:rect inStyleLayersWithIdentifiers:styleLayerIdentifiers];
            }

            NSMutableArray *geoJSONFeatures = [NSMutableArray arrayWithCapacity:features.count];
            for (id <MGLFeature> feature in features) {
                NSDictionary *geoJSONGeometry = [self geoJSONGeometryFromMGLFeature:feature];
                NSDictionary *geoJSON = @{ @"type": @"Feature",
                                           @"id": feature.identifier ? feature.identifier : [NSNull null],
                                           @"properties": feature.attributes,
                                           @"geometry": geoJSONGeometry };
                [geoJSONFeatures addObject:geoJSON];
            }

            resolve(geoJSONFeatures);
        }
    }];
}

- (NSDictionary*)geoJSONGeometryFromMGLFeature:(id <MGLFeature>)feature
{
    NSString *geometryType;

    if ([feature isKindOfClass:[MGLShapeCollectionFeature class]]) {
        geometryType = @"GeometryCollection";
        MGLShapeCollectionFeature *shapeCollection = (MGLShapeCollectionFeature *) feature;
        NSMutableArray *geometries = [[NSMutableArray alloc] init];
        for (MGLShape <MGLFeature> *shape in shapeCollection.shapes) {
            [geometries addObject:[self geoJSONGeometryFromMGLFeature:shape]];
        }
        return @{ @"type": geometryType,
                  @"geometries": geometries };
    }

    NSMutableArray *coordinates = [[NSMutableArray alloc] init];

    if ([feature isKindOfClass:[MGLPointFeature class]]) {
        geometryType = @"Point";
        coordinates = [[NSMutableArray alloc] initWithArray:@[@(feature.coordinate.longitude), @(feature.coordinate.latitude)]];
    } else if ([feature isKindOfClass:[MGLPolylineFeature class]]) {
        geometryType = @"LineString";
        MGLPolylineFeature *polyline = (MGLPolylineFeature *)feature;
        coordinates = polyline.coordinateArray;
    } else if ([feature isKindOfClass:[MGLPolygonFeature class]]) {
        geometryType = @"Polygon";
        MGLPolygonFeature *polygon = (MGLPolygonFeature *)feature;
        coordinates = polygon.coordinateArray;
    } else if ([feature isKindOfClass:[MGLMultiPolylineFeature class]]) {
        geometryType = @"MultiLineString";
        MGLMultiPolylineFeature *multiPolyline = (MGLMultiPolylineFeature *)feature;
        for (MGLPolyline *polyline in multiPolyline.polylines) {
            [coordinates addObject:polyline.coordinateArray];
        }
    } else if ([feature isKindOfClass:[MGLMultiPolygonFeature class]]) {
        geometryType = @"MultiPolygon";
        MGLMultiPolygonFeature *multiPolygon = (MGLMultiPolygonFeature *)feature;
        for (MGLPolygon *polygon in multiPolygon.polygons) {
            [coordinates addObject:polygon.coordinateArray];
        }
    } else if ([feature isKindOfClass:[MGLMultiPointFeature class]]) {
        // this is checked last since MGLPolyline and MGLPolygon inherit from MGLMultiPoint
        geometryType = @"MultiPoint";
        MGLMultiPointFeature *multiPoint = (MGLMultiPointFeature *)feature;
        for (int index = 0; index < multiPoint.pointCount; index++) {
            CLLocationCoordinate2D coord = multiPoint.coordinates[index];
            [coordinates addObject:[[NSMutableArray alloc] initWithArray:@[@(coord.longitude), @(coord.latitude)]]];
        }
    }

    return @{ @"type": geometryType,
              @"coordinates": coordinates };
}

@end
