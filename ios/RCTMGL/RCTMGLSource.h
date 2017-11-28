//
//  BaseSource.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/8/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <React/RCTComponent.h>
#import "RCTMGLLayer.h"
#import <UIKit/UIKit.h>
@import Mapbox;

@interface RCTMGLSource : UIView

extern NSString *const DEFAULT_SOURCE_ID;

@property (nonatomic, strong) NSMutableArray<id<RCTComponent>> *reactSubviews;
@property (nonatomic, strong) NSMutableArray<RCTMGLLayer*> *layers;
@property (nonatomic, strong) MGLSource *source;
@property (nonatomic, strong) MGLMapView *map;
@property (nonatomic, strong) NSDictionary<NSString *, NSNumber *> *hitbox;

@property (nonatomic, copy) NSString *id;
@property (nonatomic, assign) BOOL hasPressListener;
@property (nonatomic, copy) RCTBubblingEventBlock onPress;

- (void)addToMap;
- (void)removeFromMap;
- (MGLSource*)makeSource;
- (NSArray<NSString *> *)getLayerIDs;

+ (BOOL)isDefaultSource:(NSString*)sourceID;

@end
