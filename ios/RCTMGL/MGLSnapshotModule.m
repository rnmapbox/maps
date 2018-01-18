//
//  MGLSnapshotModule.m
//  RCTMGL
//
//  Created by Nick Italiano on 12/1/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "MGLSnapshotModule.h"
#import "RCTMGLUtils.h"
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
            if (jsOptions[@"writeToDisk"]) {
                result = [self _createFile:snapshot.image options:jsOptions];
            } else {
                result = [self _createBase64:snapshot.image options:jsOptions];
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

- (NSString *)_createFile:(UIImage *)image options:(NSDictionary *)jsOptions
{
    NSString *fileID = [[NSUUID UUID] UUIDString];
    NSString *pathComponent = [NSString stringWithFormat:@"Documents/rctmgl-snapshot-%@.%@", fileID, @"png"];
    NSString *filePath = [NSHomeDirectory() stringByAppendingPathComponent: pathComponent];
    
    NSData *data = [self _getData:image options:jsOptions];
    [data writeToFile:filePath atomically:YES];

    return filePath;
}

- (NSString *)_createBase64:(UIImage *)image options:(NSDictionary *)jsOptions
{
    NSData *data = [self _getData:image options:jsOptions];
    return [data base64EncodedStringWithOptions:NSDataBase64EncodingEndLineWithCarriageReturn];
}

- (NSData *)_getData:(UIImage *)image options:(NSDictionary *)jsOptions
{
    return UIImagePNGRepresentation(image);
}

@end
