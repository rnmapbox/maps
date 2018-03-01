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
        cancellationBlock = [weakSelf.bridge.imageLoader loadImageWithURLRequest:weakSelf.urlRequest callback:weakSelf.completionHandler];
    });
}

- (void)cancel
{
    if (cancellationBlock != nil) {
        cancellationBlock();
    }
}

@end
