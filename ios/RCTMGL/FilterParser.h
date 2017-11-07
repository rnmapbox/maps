//
//  FilterParser.h
//  RCTMGL
//
//  Created by Nick Italiano on 10/3/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//
#import <Foundation/Foundation.h>

@interface FilterParser : NSObject

+ (NSSet<NSString*>*)FILTER_OPS;
+ (NSPredicate*)parse:(NSString*)filter;

@end
