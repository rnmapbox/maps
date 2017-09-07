//
//  CameraUpdateQueue.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/6/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "CameraStop.h"
#import "CameraUpdateItem.h"
#import "RCTMGLMapView.h"

@interface CameraUpdateQueue : NSObject

- (void)enqueue:(CameraStop* _Nonnull)cameraUpdateItem;
- (CameraStop* _Nonnull)dequeue;
- (void)flush;
- (BOOL)isEmpty;
- (void)execute:(RCTMGLMapView* _Nonnull)mapView withCompletionHandler:(nullable void (^)(void))completionHandler;

@end
