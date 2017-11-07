//
//  RCTMGLVectorSource.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/8/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLVectorSource.h"

@implementation RCTMGLVectorSource

- (MGLSource*)makeSource
{
    return [[MGLVectorSource alloc] initWithIdentifier:self.id configurationURL:[NSURL URLWithString:_url]];
}

@end
