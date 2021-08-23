//
//  RCTMGLShapeSource.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/19/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLShapeSource.h"
#import "RCTMGLUtils.h"
#import "RCTMGLMapView.h"

@implementation RCTMGLShapeSource

static UIImage * _placeHolderImage;

- (void)setUrl: (NSString*) url
{
    _url = url;
    if (self.source != nil) {
        MGLShapeSource *source = (MGLShapeSource *)self.source;
        [source setURL: url == nil ? nil : [NSURL URLWithString:url]];
    }
}

- (void)setShape:(NSString *)shape
{
    _shape = shape;

    if (self.source != nil) {
        MGLShapeSource *source = (MGLShapeSource *)self.source;
        [source setShape: shape == nil ? nil : [RCTMGLUtils shapeFromGeoJSON:_shape]];
    }
}

- (void)addToMap
{
    if (self.map.style == nil) {
        return;
    }
    [super addToMap];
}

- (void)removeFromMap
{
    if (self.map.style == nil) {
        return;
    }

    [super removeFromMap];
}

- (nullable MGLSource*)makeSource
{
    NSDictionary<MGLShapeSourceOption, id> *options = [self _getOptions];

    if (_shape != nil) {
        MGLShape *shape = [RCTMGLUtils shapeFromGeoJSON:_shape];
        return [[MGLShapeSource alloc] initWithIdentifier:self.id shape:shape options:options];
    }

    if (_url != nil) {
        NSURL *url = [[NSURL alloc] initWithString:_url];
        return [[MGLShapeSource alloc] initWithIdentifier:self.id URL:url options:options];
    }
    return nil;
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

    if (_clusterMaxZoomLevel != nil) {
        options[MGLShapeSourceOptionMaximumZoomLevelForClustering] = _clusterMaxZoomLevel;
    }

    if (_maxZoomLevel != nil) {
        options[MGLShapeSourceOptionMaximumZoomLevel] = _maxZoomLevel;
    }

    if (_buffer != nil) {
        options[MGLShapeSourceOptionBuffer] = _buffer;
    }

    if (_tolerance != nil) {
        options[MGLShapeSourceOptionSimplificationTolerance] = _tolerance;
    }

    if (_lineMetrics != nil) {
        options[MGLShapeSourceOptionLineDistanceMetrics] = _lineMetrics;
    }

    return options;
}

- (nonnull NSArray<id <MGLFeature>> *)featuresMatchingPredicate:(nullable NSPredicate *)predicate
{
    MGLShapeSource *shapeSource = (MGLShapeSource *)self.source;

    return [shapeSource featuresMatchingPredicate:predicate];
}

- (double)getClusterExpansionZoom:(nonnull NSString *)featureJSON
{
    MGLShapeSource *shapeSource = (MGLShapeSource *)self.source;

    MGLPointFeature *feature = (MGLPointFeature*)[RCTMGLUtils shapeFromGeoJSON:featureJSON];
 
    return [shapeSource zoomLevelForExpandingCluster:(MGLPointFeatureCluster *)feature];
}

- (nonnull NSArray<id <MGLFeature>> *)getClusterLeaves:(nonnull NSString *)featureJSON
    number:(NSUInteger)number
    offset:(NSUInteger)offset
{
    MGLShapeSource *shapeSource = (MGLShapeSource *)self.source;

    MGLPointFeature *feature = (MGLPointFeature*)[RCTMGLUtils shapeFromGeoJSON:featureJSON];

    MGLPointFeatureCluster * cluster = (MGLPointFeatureCluster *)feature;
    return [shapeSource leavesOfCluster:cluster offset:offset limit:number];
}

- (nonnull NSArray<id <MGLFeature>> *)getClusterChildren:(nonnull NSString *)featureJSON
{
    MGLShapeSource *shapeSource = (MGLShapeSource *)self.source;
    
    MGLPointFeature *feature = (MGLPointFeature*)[RCTMGLUtils shapeFromGeoJSON:featureJSON];
    
    MGLPointFeatureCluster * cluster = (MGLPointFeatureCluster *)feature;
    return [shapeSource childrenOfCluster:cluster];
}


// Deprecated. Will be removed in 9+ ver.
- (double)getClusterExpansionZoomById:(nonnull NSNumber *)clusterId
{
    MGLShapeSource *shapeSource = (MGLShapeSource *)self.source;
    NSArray<id<MGLFeature>> *features = [shapeSource featuresMatchingPredicate: [NSPredicate predicateWithFormat:@"%K = %i", @"cluster_id", clusterId.intValue]];
    if (features.count == 0) {
        return -1;
    }
    return [shapeSource zoomLevelForExpandingCluster:(MGLPointFeatureCluster *)features[0]];
}

// Deprecated. Will be removed in 9+ ver.
- (nonnull NSArray<id <MGLFeature>> *)getClusterLeavesById:(nonnull NSNumber *)clusterId
    number:(NSUInteger)number
    offset:(NSUInteger)offset
{
    MGLShapeSource *shapeSource = (MGLShapeSource *)self.source;
    
    NSPredicate* predicate = [NSPredicate predicateWithFormat:@"cluster_id == %@", clusterId];
    NSArray<id<MGLFeature>> *features = [shapeSource featuresMatchingPredicate:predicate];
    
    MGLPointFeatureCluster * cluster = (MGLPointFeatureCluster *)features[0];
    return [shapeSource leavesOfCluster:cluster offset:offset limit:number];
}

// Deprecated. Will be removed in 9+ ver.
- (nonnull NSArray<id <MGLFeature>> *)getClusterChildrenById:(nonnull NSNumber *)clusterId
{
    MGLShapeSource *shapeSource = (MGLShapeSource *)self.source;
    
    NSPredicate* predicate = [NSPredicate predicateWithFormat:@"cluster_id == %@", clusterId];
    NSArray<id<MGLFeature>> *features = [shapeSource featuresMatchingPredicate:predicate];
    
    MGLPointFeatureCluster * cluster = (MGLPointFeatureCluster *)features[0];
    return [shapeSource childrenOfCluster:cluster];
}

@end
