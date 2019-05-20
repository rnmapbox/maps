//
//  FilterParser.m
//  RCTMGL
//
//  Created by Nick Italiano on 10/3/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "FilterParser.h"
#import <Mapbox/Mapbox.h>

@implementation FilterParser

+ (NSPredicate*)parse:(NSArray *)filterList
{
    if (filterList == nil || filterList.count < 1) {
        return nil;
    }
    return [NSPredicate predicateWithMGLJSONObject:filterList];
}

@end
