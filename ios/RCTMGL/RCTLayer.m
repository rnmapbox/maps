//
//  BaseLayer.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/8/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTLayer.h"
#import "RCTSource.h"
#import "RCTMGLStyleValue.h"
#import "RCTMGLUtils.h"

const int COMPOUND_FILTER_ALL = 3;
const int COMPOUND_FILTER_ANY = 2;
const int COMPOUND_FILTER_NONE = 1;

@implementation RCTLayer

+ (NSSet<NSString*>*)FILTER_OPS
{
    return [[NSSet alloc] initWithArray:@[@"all",
                                          @"any",
                                          @"none",
                                          @"in",
                                          @"!in",
                                          @"<=",
                                          @"<",
                                          @">=",
                                          @">",
                                          @"!=",
                                          @"==",
                                          @"has",
                                          @"!has"]];
}

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
        [self insertAbove:[_style layerWithIdentifier:aboveLayerID]];
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
        [self insertBelow:[_style layerWithIdentifier:belowLayerID]];
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
        [self insertAtIndex:(NSUInteger)_layerIndex];
    }
}

-(void)setReactStyle:(NSDictionary *)reactStyle
{
    _reactStyle = reactStyle;
}

- (void)addToMap:(MGLStyle *)style
{
    _style = style;
    
    if ([RCTSource isDefaultSource:_sourceID]) {
        _styleLayer = [style layerWithIdentifier:_id];
    } else {
        _styleLayer = [self makeLayer:style];
        [self insertLayer];
    }
    
    [self addStyles];
}

- (void)removeFromMap:(MGLStyle *)style
{
    [style removeLayer:_styleLayer];
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

- (void)insertLayer
{
    if (_aboveLayerID != nil) {
        [self insertAbove:[_style layerWithIdentifier:_aboveLayerID]];
    } else if (_belowLayerID != nil) {
        [self insertBelow:[_style layerWithIdentifier:_belowLayerID]];
    } else if (_layerIndex != nil) {
        [self insertAtIndex:(NSUInteger)_layerIndex];
    } else {
        [_style addLayer:_styleLayer];
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

-(void)insertAbove:(MGLStyleLayer*)layer
{
    if (![self _hasInitialized]) {
        return;
    }
    [_style insertLayer:_styleLayer aboveLayer:layer];
}

-(void)insertBelow:(MGLStyleLayer*)layer
{
    if (![self _hasInitialized]) {
        return;
    }
    [_style insertLayer:_styleLayer belowLayer:layer];
}

-(void)insertAtIndex:(NSUInteger)index
{
    if (![self _hasInitialized]) {
        return;
    }
    [_style insertLayer:_styleLayer atIndex:index];
}

- (void)addImage:(NSString *)url
{
    if (url == nil) {
        return;
    }
    [RCTMGLUtils fetchImage:_bridge url:url callback:^(NSError *error, UIImage *image) {
        if (image != nil) {
            [_style setImage:image forName:url];
        }
    }];
}

- (NSPredicate*)buildFilters
{
    NSPredicate *completePredicate = nil;
    
    if (_filter == nil) {
        return nil;
    }
    
    NSMutableArray<NSString*> *filterList = [[_filter componentsSeparatedByString:@";"] mutableCopy];
    
    if (filterList.count == 0) {
        return nil;
    }
    
    NSUInteger compound = 0;
    NSString *filterTypeOp = filterList[0];
    
    if ([filterTypeOp isEqualToString:@"all"]) {
        compound = COMPOUND_FILTER_ALL;
    } else if ([filterTypeOp isEqualToString:@"any"]) {
        compound = COMPOUND_FILTER_ANY;
    } else if ([filterTypeOp isEqualToString:@"none"]) {
        compound = COMPOUND_FILTER_NONE;
    }
    
    NSMutableArray<NSPredicate*> *compoundStatement = [[NSMutableArray alloc] init];
    
    if (compound > 0) {
        [filterList removeObjectAtIndex:0];
    }
    
    while (filterList.count > 0) {
        NSUInteger posPointer = 1;
        
        while (posPointer < filterList.count) {
            if ([RCTLayer.FILTER_OPS containsObject:filterList[posPointer]]) {
                break;
            }
            posPointer++;
        }
        
        NSMutableArray<NSString*> *currentFilters = [[filterList subarrayWithRange:NSMakeRange(0, posPointer)] mutableCopy];
        [filterList removeObjectsInArray:currentFilters];
        
        NSString *op = [currentFilters objectAtIndex:0];
        [currentFilters removeObjectAtIndex:0];
        
        NSPredicate *predicate = nil;
        NSString *key = [currentFilters objectAtIndex:0];
        [currentFilters removeObjectAtIndex:0];
        
        if ([op isEqualToString:@"in"]) {
            predicate = [NSPredicate predicateWithFormat:@"%K IN %@", key, currentFilters];
        } else if ([op isEqualToString:@"!in"]) {
            predicate = [NSPredicate predicateWithFormat:@"NOT %K IN %@", key, currentFilters];
        } else if ([op isEqualToString:@"<="]) {
            predicate = [NSPredicate predicateWithFormat:@"%K <= %@", key, currentFilters[0]];
        } else if ([op isEqualToString:@"<"]) {
            predicate = [NSPredicate predicateWithFormat:@"%K < %@", key, currentFilters[0]];
        } else if ([op isEqualToString:@">="]) {
            predicate = [NSPredicate predicateWithFormat:@"%K >= %@", key, currentFilters[0]];
        } else if ([op isEqualToString:@">"]) {
            predicate = [NSPredicate predicateWithFormat:@"%K > %@", key, currentFilters[0]];
        } else if ([op isEqualToString:@"!="]) {
            predicate = [NSPredicate predicateWithFormat:@"%K != %@", key, currentFilters[0]];
        } else if ([op isEqualToString:@"=="]) {
            predicate = [NSPredicate predicateWithFormat:@"%K == %@", key, currentFilters[0]];
        } else if ([op isEqualToString:@"has"]) {
            predicate = [NSPredicate predicateWithFormat:@"%K != nil", key];
        } else if ([op isEqualToString:@"!has"]) {
            predicate = [NSPredicate predicateWithFormat:@"%K == nil", key];
        }
        
        if (compound > 0) {
            [compoundStatement addObject:predicate];
        } else {
            completePredicate = predicate;
        }
    }
    
    if (compound > 0) {
        if (compound == COMPOUND_FILTER_ALL) {
            return [[NSCompoundPredicate alloc] initWithType:NSAndPredicateType subpredicates:compoundStatement];
        } else if (compound == COMPOUND_FILTER_ANY) {
            return [[NSCompoundPredicate alloc] initWithType:NSOrPredicateType subpredicates:compoundStatement];
        } else if (compound == COMPOUND_FILTER_NONE) {
            return [[NSCompoundPredicate alloc] initWithType:NSNotPredicateType subpredicates:compoundStatement];
        }
    }
    
    return completePredicate;
}

- (BOOL)_hasInitialized
{
    return _style != nil && _styleLayer != nil;
}

@end
