//
//  RCTMGLImageQueue.m
//  RCTMGL
//
//  Created by Nick Italiano on 10/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLImageQueue.h"
#import "RCTMGLImageQueueOperation.h"
#import "RCTMGLUtils.h"

@implementation RCTMGLImageQueue
{
    NSOperationQueue *imageQueue;
}

- (id)init
{
    if (self = [super init]) {
        imageQueue = [[NSOperationQueue alloc] init];
        imageQueue.name = @"com.mapbox.rctmgl.DownloadImageQueue";
    }
    return self;
}

- (void)dealloc
{
    [self cancelAllOperations];
}

+ (instancetype)sharedInstance
{
    static RCTMGLImageQueue *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[RCTMGLImageQueue alloc] init];
    });
    return sharedInstance;
}

- (void)cancelAllOperations
{
    [imageQueue cancelAllOperations];
}

- (void)addImage:(NSString *)imageURL bridge:(RCTBridge *)bridge completionHandler:(RCTImageLoaderCompletionBlock)handler
{
    RCTMGLImageQueueOperation *operation = [[RCTMGLImageQueueOperation alloc] init];
    operation.bridge = bridge;
    operation.urlRequest = [RCTConvert NSURLRequest:imageURL];
    operation.completionHandler = handler;
    [imageQueue addOperation:operation];
}

@end
