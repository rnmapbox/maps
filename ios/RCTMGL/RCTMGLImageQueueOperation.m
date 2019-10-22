//
//  RCTMGLImageQueueOperation.m
//  RCTMGL
//
//  Created by Nick Italiano on 2/28/18.
//  Copyright © 2018 Mapbox Inc. All rights reserved.
//

#import "RCTMGLImageQueueOperation.h"

@implementation RCTMGLImageQueueOperation
{
    RCTImageLoaderCancellationBlock cancellationBlock;
}

- (void)start
{
    if (self.isCancelled) {
        return;
    }

    __weak RCTMGLImageQueueOperation *weakSelf = self;
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        cancellationBlock = [[weakSelf.bridge moduleForName:@"ImageLoader" lazilyLoadIfNecessary:YES]
                             loadImageWithURLRequest:weakSelf.urlRequest
                             size:CGSizeZero
                             scale:weakSelf.scale
                             clipped:YES
                             resizeMode:RCTResizeModeStretch
                             progressBlock:nil
                             partialLoadBlock:nil
                             completionBlock:weakSelf.completionHandler];
    });
}

- (void)cancel
{
    if (cancellationBlock != nil) {
        cancellationBlock();
    }
}

@end
