//
//  RCTMGLVectorSourceManager.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/8/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLVectorSourceManager.h"
#import "RCTMGLVectorSource.h"

@implementation RCTMGLVectorSourceManager

RCT_EXPORT_MODULE();

RCT_EXPORT_VIEW_PROPERTY(id, NSString);

- (UIView*)view
{
    return [RCTMGLVectorSource new];
}

RCT_EXPORT_VIEW_PROPERTY(url, NSString);
RCT_EXPORT_VIEW_PROPERTY(hasPressListener, BOOL)
RCT_REMAP_VIEW_PROPERTY(onMapboxVectorSourcePress, onPress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(hitbox, NSDictionary)

@end
