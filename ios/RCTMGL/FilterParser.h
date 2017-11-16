//
//  FilterParser.h
//  RCTMGL
//
//  Created by Nick Italiano on 10/3/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//
#import <Foundation/Foundation.h>
#import "FilterList.h"

@interface FilterParser : NSObject

+ (NSSet<NSString*>*)FILTER_OPS;
+ (NSPredicate*)parse:(FilterList *)filter;

@end
