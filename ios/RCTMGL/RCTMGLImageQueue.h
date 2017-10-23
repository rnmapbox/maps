//
//  RCTMGLImageQueue.h
//  RCTMGL
//
//  Created by Nick Italiano on 10/23/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTImageLoader.h>

@interface RCTMGLImageQueue : NSObject

+ (instancetype)sharedInstance;

- (void)cancelAllOperations;
- (void)addImage:(NSString *)imageURL bridge:(RCTBridge *)bridge completionHandler:(RCTImageLoaderCompletionBlock)handler;

@end
