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

@property (nonatomic, weak, nullable) RCTBridge* bridge;

@property (nonatomic, strong, nullable) MGLStyleLayer *styleLayer;
@property (nonatomic, strong, nullable) MGLStyle *style;
@property (nonatomic, weak, nullable) RCTMGLMapView* map;
@property (nonatomic, strong, nullable) NSDictionary *reactStyle;
@property (nonatomic, strong, nullable) NSArray *filter;

@property (nonatomic, copy, nullable) NSString *id;
@property (nonatomic, copy, nullable) NSString *sourceID;

@property (nonatomic, copy, nullable) NSString *aboveLayerID;
@property (nonatomic, copy, nullable) NSString *belowLayerID;
@property (nonatomic, copy, nullable) NSNumber *layerIndex;

@property (nonatomic, copy, nullable) NSNumber *maxZoomLevel;
@property (nonatomic, copy, nullable) NSNumber *minZoomLevel;

- (void)addToMap:(nonnull RCTMGLMapView*)map style:(nonnull MGLStyle*)style;
- (void)addedToMap;
- (void)removeFromMap:(nonnull MGLStyle*)style;
- (nullable T)makeLayer:(nonnull MGLStyle*)style;
- (void)addStyles;
- (void)insertAbove:(nonnull NSString*)layer;
- (void)insertBelow:(nonnull NSString*)layer;
- (void)insertAtIndex:(NSUInteger)index;
- (void)insertLayer;
- (void)setZoomBounds;

- (nullable MGLSource*)layerWithSourceIDInStyle:(nonnull MGLStyle*) style;

@end
