//
//  BaseSource.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/8/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLSource.h"
#import "UIView+React.h"

@implementation RCTMGLSource

NSString *const DEFAULT_SOURCE_ID = @"composite";

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        _layers = [[NSMutableArray alloc] init];
        _reactSubviews = [[NSMutableArray alloc] init];
    }
    return self;
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)insertReactSubview:(id<RCTComponent>)subview atIndex:(NSInteger)atIndex {
    if ([subview isKindOfClass:[RCTMGLLayer class]]) {
        RCTMGLLayer *layer = (RCTMGLLayer*)subview;
        
        if (_map.style != nil) {
            [layer addToMap:_map.style];
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

- (void)setMap:(MGLMapView *)map
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
        [_map.style addSource:_source];
    }
    
    if (_layers.count > 0) {
        for (int i = 0; i < _layers.count; i++) {
            RCTMGLLayer *layer = [_layers objectAtIndex:i];
            [layer addToMap:_map.style];
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
        [_map.style removeSource:_source];
    }
}

- (MGLSource*)makeSource
{
    @throw [NSException exceptionWithName:NSInternalInconsistencyException
                        reason:[NSString stringWithFormat:@"You must override %@ in a subclass", NSStringFromSelector(_cmd)]
                        userInfo:nil];
}

+ (BOOL)isDefaultSource:(NSString *)sourceID
{
    return [sourceID isEqualToString:DEFAULT_SOURCE_ID];
}

@end
