//
//  RCTMGLTileSource.h
//  RCTMGL
//

#import "RCTMGLSource.h"
@import Mapbox;

@interface RCTMGLTileSource : RCTMGLSource

@property (nonatomic, copy) NSString *url;
@property (nonatomic, strong) NSArray<NSString *> *tileUrlTemplates;
@property (nonatomic, copy) NSString *attribution;

@property (nonatomic, strong) NSNumber *minZoomLevel;
@property (nonatomic, strong) NSNumber *maxZoomLevel;

@property (nonatomic, assign) BOOL tms;

- (NSDictionary<MGLTileSourceOption, id>*)getOptions;

@end
