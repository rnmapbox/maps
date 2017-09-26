//
//  RCTMGLRasterSource.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/25/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLRasterSource.h"

@implementation RCTMGLRasterSource

- (MGLSource*)makeSource
{
    return [[MGLRasterSource alloc] initWithIdentifier:self.id
                                    tileURLTemplates:@[_url]
                                    options:[self _getOptions]];
}

- (NSDictionary<MGLTileSourceOption, id>*)_getOptions
{
    NSMutableDictionary<MGLTileSourceOption, id> *options = [[NSMutableDictionary alloc] init];
    
    if (_maxZoomLevel != nil) {
        options[MGLTileSourceOptionMaximumZoomLevel] = _maxZoomLevel;
    }
    
    if (_minZoomLevel != nil) {
        options[MGLTileSourceOptionMinimumZoomLevel] = _minZoomLevel;
    }
    
    if (_tms) {
        options[MGLTileSourceOptionTileCoordinateSystem] = [NSNumber numberWithUnsignedInteger:MGLTileCoordinateSystemTMS];
    }

    if (_attribution != nil) {
        options[MGLTileSourceOptionAttributionHTMLString] = _attribution;
    }
    
    return options;
}

@end
