//
//  FilterList.h
//  RCTMGL
//
//  Created by Nick Italiano on 11/14/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface FilterList : NSObject

@property (nonatomic, readonly) NSUInteger count;

- (instancetype)initWithArray:(NSArray<NSDictionary *> *)rawFilterList;
- (void)removeAll:(FilterList *)filterList;
- (NSDictionary<NSString *, id> *)get:(NSUInteger)index;
- (NSString *)getString:(NSUInteger)index;
- (NSDictionary<NSString *, id> *)removeFirst;
- (FilterList *)subList:(NSUInteger)lastPosition;
- (NSArray<id> *)getValues;
- (BOOL)isEmpty;

@end
