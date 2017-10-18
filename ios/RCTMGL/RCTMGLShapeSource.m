//
//  RCTMGLShapeSource.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/19/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLShapeSource.h"
#import "RCTMGLUtils.h"

@implementation RCTMGLShapeSource

- (void)setShape:(NSString *)shape
{
    _shape = shape;
    
    if (self.source != nil) {
        MGLShapeSource *source = (MGLShapeSource *)self.source;
        [source setShape:[RCTMGLUtils shapeFromGeoJSON:_shape]];
    }
}

- (void)addToMap
{
    if (self.map.style == nil) {
        return;
    }
    
    if (_images == nil || _images.count == 0) {
        [super addToMap];
    } else {
        [RCTMGLUtils fetchImages:_bridge style:self.map.style objects:_images callback:^{ [super addToMap]; }];
    }
}

- (void)removeFromMap
{
    if (self.map.style == nil) {
        return;
    }
    
    [super removeFromMap];
    
    if (_images != nil && _images.count > 0) {
        NSArray<NSString *> *imageNames = _images.allKeys;
        
        for (NSString *imageName in imageNames) {
            [self.map.style removeImageForName:imageName];
        }
    }
}

- (MGLSource*)makeSource
{
    NSDictionary<MGLShapeSourceOption, id> *options = [self _getOptions];
    
    if (_shape != nil) {
        MGLShape *shape = [RCTMGLUtils shapeFromGeoJSON:_shape];
        return [[MGLShapeSource alloc] initWithIdentifier:self.id shape:shape options:options];
    }
    
    NSURL *url = [[NSURL alloc] initWithString:_url];
    return [[MGLShapeSource alloc] initWithIdentifier:self.id URL:url options:options];
}

- (NSDictionary<MGLShapeSourceOption, id>*)_getOptions
{
    NSMutableDictionary<MGLShapeSourceOption, id> *options = [[NSMutableDictionary alloc] init];
    
    if (_cluster != nil) {
        options[MGLShapeSourceOptionClustered] = [NSNumber numberWithBool:[_cluster intValue] == 1];
    }
    
    if (_clusterRadius != nil) {
        options[MGLShapeSourceOptionClusterRadius] = _clusterRadius;
    }
    
    if (_clusterMaxZoom != nil) {
        options[MGLShapeSourceOptionMaximumZoomLevelForClustering] = _clusterMaxZoom;
    }
    
    if (_maxZoom != nil) {
        options[MGLShapeSourceOptionMaximumZoomLevel] = _maxZoom;
    }
    
    if (_buffer != nil) {
        options[MGLShapeSourceOptionBuffer] = _buffer;
    }
    
    if (_tolerence != nil) {
        options[MGLShapeSourceOptionSimplificationTolerance] = _tolerence;
    }
    
    return options;
}

@end
