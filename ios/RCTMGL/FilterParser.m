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

+ (NSPredicate*)parse:(FilterList *)filterList
{
    NSPredicate *completePredicate = nil;
    
    if (filterList == nil || filterList.count < 2) {
        return nil;
    }
    
    NSUInteger compound = 0;
    NSString *filterTypeOp = [filterList getString:0];
    
    if ([filterTypeOp isEqualToString:@"all"]) {
        compound = COMPOUND_FILTER_ALL;
    } else if ([filterTypeOp isEqualToString:@"any"]) {
        compound = COMPOUND_FILTER_ANY;
    } else if ([filterTypeOp isEqualToString:@"none"]) {
        compound = COMPOUND_FILTER_NONE;
    }
    
    NSMutableArray<NSPredicate*> *compoundStatement = [[NSMutableArray alloc] init];
    
    if (compound > 0) {
        [filterList removeFirst];
    }
    
    while (![filterList isEmpty]) {
        NSUInteger posPointer = 1;
        
        while (posPointer < filterList.count) {
            if ([FilterParser.FILTER_OPS containsObject:[filterList getString:posPointer]]) {
                break;
            }
            posPointer++;
        }
        
        FilterList *currentFilters = [filterList subList:posPointer];
        [filterList removeAll:currentFilters];
        
        NSString *op = [currentFilters getString:0];
        [currentFilters removeFirst];
        
        NSString *key = [currentFilters getString:0];
        [currentFilters removeFirst];
        
        NSArray<id> *currentValues = [currentFilters getValues];
        NSPredicate *predicate = nil;
        
        if ([op isEqualToString:@"in"]) {
            predicate = [NSPredicate predicateWithFormat:@"%K IN %@", key, currentValues];
        } else if ([op isEqualToString:@"!in"]) {
            predicate = [NSPredicate predicateWithFormat:@"NOT %K IN %@", key, currentValues];
        } else if ([op isEqualToString:@"<="]) {
            predicate = [NSPredicate predicateWithFormat:@"%K <= %@", key, currentValues[0]];
        } else if ([op isEqualToString:@"<"]) {
            predicate = [NSPredicate predicateWithFormat:@"%K < %@", key, currentValues[0]];
        } else if ([op isEqualToString:@">="]) {
            predicate = [NSPredicate predicateWithFormat:@"%K >= %@", key, currentValues[0]];
        } else if ([op isEqualToString:@">"]) {
            predicate = [NSPredicate predicateWithFormat:@"%K > %@", key, currentValues[0]];
        } else if ([op isEqualToString:@"!="]) {
            predicate = [NSPredicate predicateWithFormat:@"%K != %@", key, currentValues[0]];
        } else if ([op isEqualToString:@"=="]) {
            predicate = [NSPredicate predicateWithFormat:@"%K == %@", key, currentValues[0]];
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
