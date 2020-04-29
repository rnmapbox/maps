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

- (void)setMap:(RCTMGLMapView *)map {
    if (map == nil) {
        [self removeFromMap:_map.style];
        _map = nil;
    } else {
        _map = map;
        [self addToMap:map style:map.style];
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
    if (style == nil) {
        return;
    }
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
        if (_styleLayer == nil) {
            RCTLogError(@"Failed to make layer: %@", _id);
            return;
        }
        [self insertLayer: map];
    }
    
    [self addStyles];
    [self addedToMap];
}

- (nullable MGLSource*)layerWithSourceIDInStyle:(nonnull MGLStyle*) style
{
    MGLSource* result = [style sourceWithIdentifier: self.sourceID];
    if (result == NULL) {
        RCTLogError(@"Cannot find layer with id: %@ referenced by layer:%@", self.sourceID, _id);
    }
    return result;
}

- (void)removeFromMap:(MGLStyle *)style
{
    if (_styleLayer != nil) {
        [style removeLayer:_styleLayer];
    }
}

- (nullable MGLStyleLayer*)makeLayer:(MGLStyle*)style
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
        [self->_style insertLayer:self->_styleLayer aboveLayer:layer];
        [self->_map layerAdded:self->_styleLayer];
    }];
}

-(void)insertBelow:(NSString*)belowLayerID
{
    [_map waitForLayerWithID: belowLayerID then:^void (MGLStyleLayer* layer) {
        if (![self _hasInitialized]) {
            return;
        }
        
        [self->_style insertLayer:self->_styleLayer belowLayer:layer];
        [self->_map layerAdded:self->_styleLayer];
    }];
}

-(void)insertAtIndex:(NSUInteger)index
{
    if (![self _hasInitialized]) {
        return;
    }
    NSArray *layers = _style.layers;
    if (index >= layers.count) {
        RCTLogWarn(@"Layer index is greater than number of layers on map. Layer inserted at end of layer stack.");
        index = layers.count - 1;
    }
    [_style insertLayer:self->_styleLayer atIndex:index];
    [_map layerAdded:self->_styleLayer];
}

- (BOOL)_hasInitialized
{
    return _style != nil && _styleLayer != nil;
}

@end
