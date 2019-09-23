//
//  BaseSource.m
//  RCTMGL
//

#import "RCTMGLTileSource.h"

@implementation RCTMGLTileSource

- (NSDictionary<MGLTileSourceOption, id>*)getOptions {
    NSMutableDictionary<MGLTileSourceOption, id> *options = [[NSMutableDictionary alloc] init];
    
    if (self.maxZoomLevel != nil) {
        options[MGLTileSourceOptionMaximumZoomLevel] = self.maxZoomLevel;
    }
    
    if (self.minZoomLevel != nil) {
        options[MGLTileSourceOptionMinimumZoomLevel] = self.minZoomLevel;
    }
    
    if (self.tms) {
        options[MGLTileSourceOptionTileCoordinateSystem] = [NSNumber numberWithUnsignedInteger:MGLTileCoordinateSystemTMS];
    }
    
    if (self.attribution != nil) {
        options[MGLTileSourceOptionAttributionHTMLString] = self.attribution;
    }
    
    return options;
}
@end
