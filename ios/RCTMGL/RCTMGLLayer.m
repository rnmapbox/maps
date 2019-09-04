//
//  BaseLayer.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/8/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLLayer.h"
#import "RCTMGLSource.h"
#import "RCTMGLStyleValue.h"
#import "RCTMGLUtils.h"
#import "FilterParser.h"
#import "RCTMGLMapView.h"

@implementation RCTMGLLayer

- (void)setMinZoomLevel:(NSNumber*)minZoomLevel
{
    _minZoomLevel = minZoomLevel;
    
    if (_styleLayer != nil) {
        _styleLayer.minimumZoomLevel = [_minZoomLevel doubleValue];
    }
}

- (void)setMaxZoomLevel:(NSNumber*)maxZoomLevel
{
    _maxZoomLevel = maxZoomLevel;
    
    if (_styleLayer != nil) {
        _styleLayer.maximumZoomLevel = [_maxZoomLevel doubleValue];
    }
}

- (void)setAboveLayerID:(NSString *)aboveLayerID
{
    if (_aboveLayerID != nil && _aboveLayerID == aboveLayerID) {
        return;
    }
    
    _aboveLayerID = aboveLayerID;
    if (_styleLayer != nil) {
        [self removeFromMap:_style];
        [self insertAbove:aboveLayerID];
    }
}

- (void)setBelowLayerID:(NSString *)belowLayerID
{
    if (_belowLayerID != nil && _belowLayerID == belowLayerID) {
        return;
    }
    
    _belowLayerID = belowLayerID;
    if (_styleLayer != nil) {
        [self removeFromMap:_style];
        [self insertBelow:_belowLayerID];
    }
}

- (void)setLayerIndex:(NSNumber *)layerIndex
{
    if (_layerIndex != nil && _layerIndex == layerIndex) {
        return;
    }
    
    _layerIndex = layerIndex;
    if (_styleLayer != nil) {
        [self removeFromMap:_style];
        [self insertAtIndex:_layerIndex.unsignedIntegerValue];
    }
}

- (void)setFilter:(NSArray *)filter
{
    _filter = filter;
    
    if (_styleLayer != nil) {
        NSPredicate *predicate = [self buildFilters];
        if (predicate) {
            [self updateFilter:predicate];
        }
    }
}

-(void)setReactStyle:(NSDictionary *)reactStyle
{
    _reactStyle = reactStyle;
    
    if (_styleLayer != nil) {
        dispatch_async(dispatch_get_main_queue(), ^{
           [self addStyles];
        });
    }
}

- (void)addToMap:(RCTMGLMapView*) map style:(MGLStyle *)style
{
    _map = map;
    _style = style;
    if (_id == nil) {
      RCTLogError(@"Cannot add a layer without id to the map: %@", self);
      return;
    }
    MGLStyleLayer *existingLayer = [style layerWithIdentifier:_id];
    if (existingLayer != nil) {
        _styleLayer = existingLayer;
    } else {
        _styleLayer = [self makeLayer:style];
        [self insertLayer: map];
    }
    
    [self addStyles];
    [self addedToMap];
}

- (void)removeFromMap:(MGLStyle *)style
{
    if (_styleLayer != nil) {
        [style removeLayer:_styleLayer];
    }
}

- (MGLStyleLayer*)makeLayer:(MGLStyle*)style
{
    @throw [NSException exceptionWithName:NSInternalInconsistencyException
                        reason:[NSString stringWithFormat:@"You must override %@ in a subclass", NSStringFromSelector(_cmd)]
                        userInfo:nil];
}

- (void)addStyles
{
    @throw [NSException exceptionWithName:NSInternalInconsistencyException
                                   reason:[NSString stringWithFormat:@"You must override %@ in a subclass", NSStringFromSelector(_cmd)]
                                 userInfo:nil];
}

- (void)addedToMap
{
    // override if you want
}

- (void)updateFilter:(NSPredicate *)predicate
{
    // override if you want to update the filter
}

- (void)insertLayer: (RCTMGLMapView*) map
{
    if ([_style layerWithIdentifier:_id] != nil) {
        return; // prevent layer from being added twice
    }

    if (_aboveLayerID != nil) {
        [self insertAbove:_aboveLayerID];
    } else if (_belowLayerID != nil) {
        [self insertBelow:_belowLayerID];
    } else if (_layerIndex != nil) {
        [self insertAtIndex:_layerIndex.unsignedIntegerValue];
    } else {
        [_style addLayer:_styleLayer];
        [_map layerAdded:_styleLayer];
    }
    
    [self setZoomBounds];
}

- (void)setZoomBounds
{
    if (_maxZoomLevel != nil) {
        _styleLayer.maximumZoomLevel = [_maxZoomLevel doubleValue];
    }
    
    if (_minZoomLevel != nil) {
        _styleLayer.minimumZoomLevel = [_minZoomLevel doubleValue];
    }
}

-(void)insertAbove:(NSString*)aboveLayerIDs
{
    [_map waitForLayerWithID: aboveLayerIDs then:^void (MGLStyleLayer* layer) {
        if (![self _hasInitialized]) {
            return;
        }
        [_style insertLayer:_styleLayer aboveLayer:layer];
        [_map layerAdded:_styleLayer];
    }];
}

-(void)insertBelow:(NSString*)belowLayerID
{
    [_map waitForLayerWithID: belowLayerID then:^void (MGLStyleLayer* layer) {
        if (![self _hasInitialized]) {
            return;
        }
        
        [_style insertLayer:_styleLayer belowLayer:layer];
        [_map layerAdded:_styleLayer];
    }];
}

-(void)insertAtIndex:(NSUInteger)index
{
    if (![self _hasInitialized]) {
        return;
    }
    [_style insertLayer:_styleLayer atIndex:index];
    [_map layerAdded:_styleLayer];
}

- (void)addImage:(NSString *)url
{
    if (url == nil) {
        return;
    }
    [RCTMGLUtils fetchImage:_bridge url:url scale:1.0 callback:^(NSError *error, UIImage *image) {
        if (image != nil) {
            [_style setImage:image forName:url];
        }
    }];
}

- (NSPredicate*)buildFilters
{
    return _filter ? [FilterParser parse:_filter] : nil;
}

- (BOOL)_hasInitialized
{
    return _style != nil && _styleLayer != nil;
}

@end
