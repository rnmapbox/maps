//
//  RCTMGLImageQueue.m
//  RCTMGL
//
//  Created by Nick Italiano on 10/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLImageQueue.h"
#import "RCTMGLUtils.h"

@implementation RCTMGLImageQueue
{
    NSOperationQueue *imageQueue;
    NSMutableArray<RCTImageLoaderCancellationBlock> *cancellationBlocks;
}

- (id)init
{
    if (self = [super init]) {
        imageQueue = [[NSOperationQueue alloc] init];
        imageQueue.name = @"com.mapbox.rctmgl.DownloadImageQueue";
        cancellationBlocks = [[NSMutableArray alloc] init];
    }
    return self;
}

- (void)dealloc
{
    if (cancellationBlocks.count > 0) {
        for (RCTImageLoaderCancellationBlock cancelBlock in cancellationBlocks) {
            cancelBlock();
        }
    }
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
    NSBlockOperation *downloadOperation = [[NSBlockOperation alloc] init];
    
    [downloadOperation addExecutionBlock:^{
        RCTImageLoaderCancellationBlock cancelBlock = [bridge.imageLoader loadImageWithURLRequest:[RCTConvert NSURLRequest:imageURL] callback:handler];
        [cancellationBlocks addObject:cancelBlock];
    }];
    
    [imageQueue addOperation:downloadOperation];
}

@end
