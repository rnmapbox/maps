//
//  RCTMapboxGLModuleManager.m
//  RCTMapboxGL
//
//  Created by Marius Petcu on 20/06/16.
//  Copyright © 2016 Mapbox. All rights reserved.
//

#import <Mapbox/Mapbox.h>
#import "RCTMapboxGLModuleManager.h"
#import "RCTBridge.h"
#import "RCTUIManager.h"

#import "RCTMapboxGL.h"

@implementation RCTMapboxGLModuleManager

RCT_EXPORT_MODULE();
@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
    return _bridge.uiManager.methodQueue;
}

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
             @"metricsEnabled": @([RCTMapboxGLModuleManager metricsEnabled])
             };
};

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


RCT_EXPORT_METHOD(setAccessToken:(nonnull NSString *)accessToken)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [MGLAccountManager setAccessToken:accessToken];
    });
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
    if ([options objectForKey:@"metadata"] == nil) {
        return RCTLogError(@"metadata is required.");
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
        
        NSMutableDictionary *userInfo = [metadata mutableCopy];
        userInfo[@"name"] = name;
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

RCT_EXPORT_METHOD(getPacks:(RCTResponseSenderBlock)callback)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        NSMutableArray* callbackArray = [NSMutableArray new];
        
        MGLOfflinePack *packs = [MGLOfflineStorage sharedOfflineStorage].packs;
        
        for (MGLOfflinePack *pack in packs) {
            NSMutableDictionary *packDict = [NSMutableDictionary new];
            NSMutableDictionary *userInfo = [[NSKeyedUnarchiver unarchiveObjectWithData:pack.context] mutableCopy];
            [packDict setObject:userInfo[@"name"] forKey:@"name"];
            [userInfo removeObjectForKey:@"name"];
            [packDict setObject:userInfo forKey:@"metadata"];
            [packDict setObject:@(pack.progress.countOfBytesCompleted) forKey:@"countOfBytesCompleted"];
            [packDict setObject:@(pack.progress.countOfResourcesCompleted) forKey:@"countOfResourcesCompleted"];
            [callbackArray addObject:packDict];
        }
        
        callback(@[[NSNull null], callbackArray]);
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
        
        [[MGLOfflineStorage sharedOfflineStorage] removePack:tempPack withCompletionHandler:^(NSError * _Nullable error) {
            if (error != nil) {
                RCTLogError(@"Error: %@", error.localizedFailureReason);
            } else {
                NSMutableDictionary *deletedObject = [NSMutableDictionary new];
                [deletedObject setObject:userInfo[@"name"] forKey:@"deleted"];
                callback(@[[NSNull null], deletedObject]);
            }
        }];
    });
}

// View methods

RCT_EXPORT_METHOD(getCenterCoordinateZoomLevel:(nonnull NSNumber *)reactTag
                  callback:(RCTResponseSenderBlock)callback)
{
    [_bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTMapboxGL *> *viewRegistry) {
        RCTMapboxGL *mapView = viewRegistry[reactTag];
        NSMutableDictionary* callbackDict = [NSMutableDictionary new];
        CLLocationCoordinate2D region = [mapView centerCoordinate];
        double zoom = [mapView zoomLevel];
        
        [callbackDict setValue:@(region.latitude) forKey:@"latitude"];
        [callbackDict setValue:@(region.longitude) forKey:@"longitude"];
        [callbackDict setValue:@(region.longitude) forKey:@"longitude"];
        [callbackDict setValue:@(zoom) forKey:@"zoom"];
        
        callback(@[callbackDict]);
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
        NSMutableDictionary* callbackDict = [NSMutableDictionary new];
        double direction = [mapView direction];
        
        [callbackDict setValue:@(direction) forKey:@"direction"];
        
        callback(@[callbackDict]);
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
