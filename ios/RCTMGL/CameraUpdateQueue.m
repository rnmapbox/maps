//
//  CameraUpdateQueue.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/6/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "CameraUpdateQueue.h"

@implementation CameraUpdateQueue
{
    NSMutableArray<CameraStop*> *queue;
}

- (instancetype)init
{
    if (self = [super init]) {
        queue = [[NSMutableArray alloc] init];
    }
    
    return self;
}

- (void)enqueue:(CameraStop*)cameraUpdateItem
{
    [queue addObject:cameraUpdateItem];
}

- (CameraStop*)dequeue
{
    if ([self isEmpty]) {
        return nil;
    }
    CameraStop *stop = queue.firstObject;
    [queue removeObjectAtIndex:0];
    return stop;
}

- (void)flush
{
    [queue removeAllObjects];
}

- (BOOL)isEmpty
{
    return queue.count == 0;
}

- (void)execute:(RCTMGLMapView*)mapView withCompletionHandler:(nullable void (^)(void))completeAllHandler
{
    if ([self isEmpty]) {
        if (completeAllHandler != nil) {
            completeAllHandler();
        }
        return;
    }

    CameraStop *stop = [self dequeue];
    if (stop == nil) {
        return;
    }
    
    CameraUpdateItem *item = [[CameraUpdateItem alloc] init];
    item.cameraStop = stop;
    
    __weak CameraUpdateQueue *weakSelf = self;
    [item execute:mapView withCompletionHandler:^{ [weakSelf execute:mapView withCompletionHandler:completeAllHandler]; }];
}

@end
