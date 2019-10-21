//
//  BaseLayer.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/8/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <React/RCTBridge.h>


@class RCTMGLMapView;

@import Mapbox;

@interface RCTMGLLayer<T> : UIView

@property (nonatomic, weak) RCTBridge *bridge;

@property (nonatomic, strong) MGLStyleLayer *styleLayer;
@property (nonatomic, strong) MGLStyle *style;
@property (nonatomic, weak) RCTMGLMapView* map;
@property (nonatomic, strong) NSDictionary *reactStyle;
@property (nonatomic, strong) NSArray *filter;

@property (nonatomic, copy) NSString *id;
@property (nonatomic, copy) NSString *sourceID;

@property (nonatomic, copy) NSString *aboveLayerID;
@property (nonatomic, copy) NSString *belowLayerID;
@property (nonatomic, copy) NSNumber *layerIndex;

@property (nonatomic, copy) NSNumber *maxZoomLevel;
@property (nonatomic, copy) NSNumber *minZoomLevel;

- (void)addToMap:(RCTMGLMapView*)map style:(MGLStyle*)style;
- (void)addedToMap;
- (void)removeFromMap:(MGLStyle*)style;
- (T)makeLayer:(MGLStyle*)style;
- (void)addStyles;
- (void)insertAbove:(NSString*)layer;
- (void)insertBelow:(NSString*)layer;
- (void)insertAtIndex:(NSUInteger)index;
- (void)insertLayer;
- (void)setZoomBounds;
- (void)addImage:(NSString*)url;

@end
