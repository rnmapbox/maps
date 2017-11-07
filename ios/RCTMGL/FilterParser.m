//
//  FilterParser.m
//  RCTMGL
//
//  Created by Nick Italiano on 10/3/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "FilterParser.h"

const int COMPOUND_FILTER_ALL = 3;
const int COMPOUND_FILTER_ANY = 2;
const int COMPOUND_FILTER_NONE = 1;

@implementation FilterParser

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

+ (NSPredicate*)parse:(NSString*)filter
{
    NSPredicate *completePredicate = nil;
    
    if (filter == nil) {
        return nil;
    }
    
    NSMutableArray<NSString*> *filterList = [[filter componentsSeparatedByString:@";"] mutableCopy];
    
    if (filterList.count < 2) {
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
            if ([FilterParser.FILTER_OPS containsObject:filterList[posPointer]]) {
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

@end
