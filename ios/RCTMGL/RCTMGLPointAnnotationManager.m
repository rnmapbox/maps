//
//  RCTMGLPointAnnotationManager.m
//  RCTMGL
//
//  Created by Nick Italiano on 10/12/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLPointAnnotationManager.h"
#import "RCTMGLPointAnnotation.h"

@implementation RCTMGLPointAnnotationManager

RCT_EXPORT_MODULE()

RCT_EXPORT_VIEW_PROPERTY(id, NSString)
RCT_EXPORT_VIEW_PROPERTY(anchor, NSDictionary)

RCT_REMAP_VIEW_PROPERTY(selected, reactSelected, BOOL)
RCT_REMAP_VIEW_PROPERTY(title, reactTitle, NSString)
RCT_REMAP_VIEW_PROPERTY(snippet, reactSnippet, NSString)
RCT_REMAP_VIEW_PROPERTY(coordinate, reactCoordinate, NSString)

RCT_REMAP_VIEW_PROPERTY(onMapboxPointAnnotationSelected, onSelected, RCTBubblingEventBlock)
RCT_REMAP_VIEW_PROPERTY(onMapboxPointAnnotationDeselected, onDeselected, RCTBubblingEventBlock)

- (UIView *)view
{
    return [[RCTMGLPointAnnotation alloc] init];
}

@end
