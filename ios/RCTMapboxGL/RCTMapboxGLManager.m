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
#import "RCTConvert+CoreLocation.h"
#import "RCTConvert+MapKit.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
#import "UIView+React.h"
#import "RCTUIManager.h"
#import "RCTMapboxGLConversions.h"

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
RCT_EXPORT_VIEW_PROPERTY(showsUserLocation, BOOL);
RCT_EXPORT_VIEW_PROPERTY(styleURL, NSURL);
RCT_EXPORT_VIEW_PROPERTY(userTrackingMode, int);
RCT_EXPORT_VIEW_PROPERTY(attributionButtonIsHidden, BOOL);
RCT_EXPORT_VIEW_PROPERTY(logoIsHidden, BOOL);
RCT_EXPORT_VIEW_PROPERTY(compassIsHidden, BOOL);
RCT_EXPORT_VIEW_PROPERTY(userLocationVerticalAlignment, int);

RCT_EXPORT_VIEW_PROPERTY(onRegionChange, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onRegionWillChange, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onChangeUserTrackingMode, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onOpenAnnotation, RCTDirectEventBlock);
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
    
    // Setup pack array loading notifications
    [[MGLOfflineStorage sharedOfflineStorage] addObserver:self forKeyPath:@"packs" options:0 context:NULL];
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
    
    for (MGLOfflinePack * pack in packs) {
        [pack requestProgress];
        [pack resume];
    }
    
    if ([_packRequests count]) {
        NSArray * callbackArray = [self serializePacksArray:packs];
        for (RCTResponseSenderBlock callback in _packRequests) {
            callback(@[[NSNull null], callbackArray]);
        }
        [_packRequests removeAllObjects];
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
    
    if ([_removedPacks containsObject:pack]) {
        return;
    }
    
    if ([_recentPacks containsObject:pack]) {
        [_throttledPacks addObject:pack];
        return;
    }
    
    [_recentPacks addObject:pack];
    [self firePackProgress:pack];
    
    NSBlockOperation * timerCallback = [NSBlockOperation blockOperationWithBlock:^{
        [_recentPacks removeObject:pack];
        if ([_throttledPacks containsObject:pack]) {
            [_throttledPacks removeObject:pack];
            [self firePackProgress:pack];
        }
    }];
    
    [NSTimer scheduledTimerWithTimeInterval:0.1
                                     target:timerCallback
                                   selector:@selector(main)
                                   userInfo:nil
                                    repeats:NO];
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

RCT_EXPORT_METHOD(addPackForRegion:(NSDictionary*)options
                  callback:(RCTResponseSenderBlock)callback)
{
    if ([options objectForKey:@"name"] == nil) {
        return RCTLogError(@"Name is required.");
    }
    if ([options objectForKey:@"minZoomLevel"] == nil) {
        return RCTLogError(@"minZoomLevel is required.");
    }
    if ([options objectForKey:@"maxZoomLevel"] == nil) {
        return RCTLogError(@"maxZoomLevel is required.");
    }
    if ([options objectForKey:@"bounds"] == nil) {
        return RCTLogError(@"bounds is required.");
    }
    if ([options objectForKey:@"styleURL"] == nil) {
        return RCTLogError(@"styleURL is required.");
    }
    if (!([[options objectForKey:@"type"] isEqualToString:@"bbox"])) {
        return RCTLogError(@"Offline type %@ not supported. Only type `bbox` supported.", [options valueForKey:@"type"]);
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
                RCTLogError(@"Error: %@", error.localizedFailureReason);
            } else {
                [pack resume];
                callback(@[[NSNull null]]);
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

RCT_EXPORT_METHOD(getPacks:(RCTResponseSenderBlock)callback)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        NSMutableArray* callbackArray = [NSMutableArray new];
        
        MGLOfflinePack *packs = [MGLOfflineStorage sharedOfflineStorage].packs;
        
        if (!packs) {
            [_packRequests addObject:callback];
        } else {
            callback(@[[NSNull null], [self serializePacksArray:packs]]);
        }
    });
}

RCT_EXPORT_METHOD(removePack:(NSString*)packName
                  callback:(RCTResponseSenderBlock)callback)
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
            return callback(@[[NSNull null]]);
        }
        
        NSDictionary *userInfo = [NSKeyedUnarchiver unarchiveObjectWithData:tempPack.context];
        
        [_removedPacks addObject:tempPack];
        [self discardThrottleForPack:tempPack];
        [tempPack suspend];
        
        void (^removePack)(void) = ^{
            [_removedPacks removeObject:tempPack];
            [[MGLOfflineStorage sharedOfflineStorage] removePack:tempPack withCompletionHandler:^(NSError * _Nullable error) {
                if (error != nil) {
                    callback(@[@{ @"message": error.localizedFailureReason }]);
                } else {
                    NSMutableDictionary *deletedObject = [NSMutableDictionary new];
                    [deletedObject setObject:userInfo[@"name"] forKey:@"deleted"];
                    callback(@[[NSNull null], deletedObject]);
                }
            }];
        };
        
        // Workaround for https://github.com/mapbox/mapbox-gl-native/issues/5508
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 100 * NSEC_PER_MSEC), dispatch_get_main_queue(), removePack);
    });
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

RCT_EXPORT_METHOD(setCenterZoomDirection:(nonnull NSNumber *)reactTag
                  options:(NSDictionary *)options
                  animated:(BOOL)animated
                  callback:(RCTResponseSenderBlock)callback)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            
            NSNumber * latitude = [options objectForKey:@"latitude"];
            NSNumber * longitude = [options objectForKey:@"longitude"];
            NSNumber * zoom = [options objectForKey:@"zoomLevel"];
            NSNumber * direction = [options objectForKey:@"direction"];
            
            CLLocationCoordinate2D _center = (latitude && longitude)
            ? CLLocationCoordinate2DMake([latitude doubleValue], [longitude doubleValue])
            : mapView.centerCoordinate;
            
            double _direction = direction ? [direction doubleValue] : mapView.direction;
            double _zoomLevel = zoom ? [zoom doubleValue] : mapView.zoomLevel;
            
            [mapView setCenterCoordinate: _center
                               zoomLevel: _zoomLevel
                               direction: _direction
                                animated: animated
                       completionHandler: ^{
                           callback(@[[NSNull null]]);
                       }];
        }
    }];
}

RCT_EXPORT_METHOD(setCamera:(nonnull NSNumber *)reactTag
                  latitude:(float) latitude
                  longitude:(float) longitude
                  fromDistance:(int) fromDistance
                  pitch:(int) pitch
                  heading:(int) heading
                  duration:(int) duration)
{
    CLLocationCoordinate2D center = CLLocationCoordinate2DMake(latitude, longitude);
    MGLMapCamera *camera = [MGLMapCamera cameraLookingAtCenterCoordinate:center fromDistance:fromDistance pitch:pitch heading:heading];
    
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        if ([mapView isKindOfClass:[RCTMapboxGL class]]) {
            [mapView setCamera:camera withDuration:duration animationTimingFunction:[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut]];
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

@end
