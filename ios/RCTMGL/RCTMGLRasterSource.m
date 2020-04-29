//
//  RCTMGLRasterSource.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/25/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLRasterSource.h"

@implementation RCTMGLRasterSource

- (nullable MGLSource*)makeSource
{
    if (self.url != nil) {
        NSURL *url = [NSURL URLWithString:self.url];
        if (self.tileSize != nil) {
            return [[MGLRasterTileSource alloc] initWithIdentifier:self.id configurationURL:url tileSize:[self.tileSize floatValue]];
        }
        return [[MGLRasterTileSource alloc] initWithIdentifier:self.id configurationURL:url];
    }
    return [[MGLRasterTileSource alloc] initWithIdentifier:self.id tileURLTemplates:self.tileUrlTemplates options:[self getOptions]];
}

- (NSDictionary<MGLTileSourceOption,id> *)getOptions {
    NSMutableDictionary<MGLTileSourceOption, id> *options = [[NSMutableDictionary alloc] initWithDictionary:[super getOptions]];
    
    if (self.tileSize != nil) {
        options[MGLTileSourceOptionTileSize] = _tileSize;
    }
    
    return options;
}

@end
