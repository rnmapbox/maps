//
//  BaseSource.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/8/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLSource.h"
#import <React/UIView+React.h>
#import "RCTMGLMapView.h"
#import <React/RCTLog.h>

@implementation RCTMGLSource

double const DEFAULT_HITBOX_AREA = 44.0;
NSString *const DEFAULT_SOURCE_ID = @"composite";


- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        _layers = [[NSMutableArray alloc] init];
        _reactSubviews = [[NSMutableArray alloc] init];
        _hitbox = @{ @"width": @(DEFAULT_HITBOX_AREA), @"height": @(DEFAULT_HITBOX_AREA) };
    }
    return self;
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)insertReactSubview:(id<RCTComponent>)subview atIndex:(NSInteger)atIndex {
    if ([subview isKindOfClass:[RCTMGLLayer class]]) {
        RCTMGLLayer *layer = (RCTMGLLayer*)subview;
        
        if (_map.style != nil) {
            [layer addToMap:_map style:_map.style];
        }

        [_layers addObject:layer];
        [_reactSubviews insertObject:layer atIndex:atIndex];
    }
}
#pragma clang diagnostic pop

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)removeReactSubview:(id<RCTComponent>)subview {
    if ([subview isKindOfClass:[RCTMGLLayer class]]) {
        RCTMGLLayer *layer = (RCTMGLLayer*)subview;
        [layer removeFromMap:_map.style];
        [_layers removeObject:layer];
        [_reactSubviews removeObject:layer];
    }
}
#pragma clang diagnostic pop

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (NSArray<id<RCTComponent>> *)reactSubviews {
    return _reactSubviews;
}
#pragma clang diagnostic pop

- (void)setMap:(RCTMGLMapView *)map
{
    if (map == nil) {
        [self removeFromMap];
        _map = nil;
    } else {
        _map = map;
        [self addToMap];
    }
}

- (void)addToMap
{
    if (_map.style == nil) {
        return;
    }
    
    MGLSource *existingSource = [_map.style sourceWithIdentifier:_id];
    if (existingSource != nil) {
        _source = existingSource;
    } else {
        _source = [self makeSource];
        if (_source != nil) {
            [_map.style addSource:_source];
        } else {
            RCTLogError(@"Could not create source with id:%@. Make sure url/shape is provided", _id);
        }
    }
    
    if (_layers.count > 0) {
        for (int i = 0; i < _layers.count; i++) {
            RCTMGLLayer *layer = [_layers objectAtIndex:i];
            [layer addToMap:_map style:_map.style];
        }
    }
}

- (void)removeFromMap
{
    if (_map.style == nil) {
        return;
    }
    
    for (int i = 0; i < _layers.count; i++) {
        RCTMGLLayer *layer = [_layers objectAtIndex:i];
        [layer removeFromMap:_map.style];
    }
    
    if (![RCTMGLSource isDefaultSource:_id]) {
        if (_source != nil) {
            [_map.style removeSource:_source];
        }
    }
}

- (nullable MGLSource*)makeSource
{
    @throw [NSException exceptionWithName:NSInternalInconsistencyException
                        reason:[NSString stringWithFormat:@"You must override %@ in a subclass", NSStringFromSelector(_cmd)]
                        userInfo:nil];
}

- (NSArray<NSString *> *)getLayerIDs
{
    NSMutableArray *layerIDs = [[NSMutableArray alloc] init];
    
    for (RCTMGLLayer *layer in _layers) {
        [layerIDs addObject:layer.id];
    }
    
    return layerIDs;
}

+ (BOOL)isDefaultSource:(NSString *)sourceID
{
    return [sourceID isEqualToString:DEFAULT_SOURCE_ID];
}

@end
