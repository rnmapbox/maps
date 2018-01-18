//
//  MGLSnapshotModule.m
//  RCTMGL
//
//  Created by Nick Italiano on 12/1/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "MGLSnapshotModule.h"
#import "RCTMGLUtils.h"
#import "RNMBImageUtils.h"
@import Mapbox;

@implementation MGLSnapshotModule

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

RCT_EXPORT_METHOD(takeSnap:(NSDictionary *)jsOptions
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        MGLMapSnapshotOptions *options = [self _getOptions:jsOptions];
        MGLMapSnapshotter *snapshotter = [[MGLMapSnapshotter alloc] initWithOptions:options];
        
        [snapshotter startWithCompletionHandler:^(MGLMapSnapshot *snapshot, NSError *err) {
            if (err != nil) {
                reject(@"takeSnap", @"Could not create snapshot", err);
                return;
            }
            
            NSString *result = nil;
            if ([jsOptions[@"writeToDisk"] boolValue]) {
                result = [RNMBImageUtils createTempFile:snapshot.image];
            } else {
                result = [RNMBImageUtils createBase64:snapshot.image];
            }
            
            resolve(result);
        }];
    });
}

- (MGLMapSnapshotOptions *)_getOptions:(NSDictionary *)jsOptions
{
    MGLMapCamera *camera = [[MGLMapCamera alloc] init];
    
    camera.pitch = [jsOptions[@"pitch"] doubleValue];
    camera.heading = [jsOptions[@"heading"] doubleValue];
    
    if (jsOptions[@"centerCoordinate"] != nil) {
        camera.centerCoordinate = [RCTMGLUtils fromFeature:jsOptions[@"centerCoordinate"]];
    }
    
    NSNumber *width = jsOptions[@"width"];
    NSNumber *height = jsOptions[@"height"];
    CGSize size = CGSizeMake([width doubleValue], [height doubleValue]);
    
    MGLMapSnapshotOptions *options = [[MGLMapSnapshotOptions alloc] initWithStyleURL:[NSURL URLWithString:jsOptions[@"styleURL"]]
                                                                   camera:camera
                                                                   size:size];
    if (jsOptions[@"zoomLevel"] != nil) {
        options.zoomLevel = [jsOptions[@"zoomLevel"] doubleValue];
    }
    
    if (jsOptions[@"bounds"] != nil) {
        options.coordinateBounds = [RCTMGLUtils fromFeatureCollection:jsOptions[@"bounds"]];
    }

    return options;
}

@end
