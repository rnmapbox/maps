//
//  RCTMGLImageQueueOperation.h
//  RCTMGL
//
//  Created by Nick Italiano on 2/28/18.
//  Copyright © 2018 Mapbox Inc. All rights reserved.
//
#import <React/RCTImageSource.h>
#import <React/RCTImageLoader.h>
#import <React/RCTGIFImageDecoder.h>

@interface RCTMGLImageQueueOperation : NSBlockOperation

@property (nonatomic, weak) RCTBridge *bridge;
@property (nonatomic, copy) RCTImageLoaderCompletionBlock completionHandler;
@property (nonatomic, copy) NSURLRequest *urlRequest;
@property (nonatomic)       double scale;

@end
