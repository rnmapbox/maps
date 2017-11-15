//
//  FilterList.m
//  RCTMGL
//
//  Created by Nick Italiano on 11/14/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "FilterList.h"

@implementation FilterList
{
    NSMutableArray<NSDictionary<NSString *, id> *> *items;
}

- (instancetype)initWithArray:(NSArray<NSDictionary *> *)rawFilterList
{
    if (self = [super init]) {
        items = [NSMutableArray new];
        
        if (rawFilterList != nil) {
            items = [rawFilterList mutableCopy];
        }
    }
    
    return self;
}

- (void)removeAll:(FilterList*)filterList
{
    for (NSUInteger i = 0; i < filterList.count; i++) {
        NSDictionary<NSString *, id> *item = [filterList get:i];
        [items removeObjectIdenticalTo:item];
    }
}

- (NSDictionary<NSString *, id> *)removeFirst
{
    NSDictionary<NSString *, id> *item = items[0];
    [items removeObjectAtIndex:0];
    return item;
}

- (NSDictionary<NSString *, id> *)get:(NSUInteger)index
{
    return [items objectAtIndex:index];
}

- (NSString *)getString:(NSUInteger)index
{
    NSDictionary<NSString *, id> *item = [self get:index];
    
    if (![item[@"type"] isEqualToString:@"string"]) {
        return @"";
    }
    
    return (NSString *)item[@"value"];
}

- (FilterList *)subList:(NSUInteger)lastPosition
{
    NSArray<NSDictionary<NSString *, id> *> *slice = [[items subarrayWithRange:NSMakeRange(0, lastPosition)] mutableCopy];
    return [[FilterList alloc] initWithArray:slice];
}

- (NSArray<id> *)getValues
{
    NSMutableArray<id> *values = [[NSMutableArray alloc] init];
    
    for (NSDictionary<NSString *, id> *item in items) {
        [values addObject:item[@"value"]];
    }
    
    return values;
}

- (BOOL)isEmpty
{
    return self.count == 0;
}

- (NSUInteger)count
{
    return items.count;
}

@end
