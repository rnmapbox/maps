//
//  RCTMGLVectorSource.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/8/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLVectorSource.h"

@implementation RCTMGLVectorSource

- (nullable MGLSource*)makeSource
{
    if (self.url != nil) {
        return [[MGLVectorTileSource alloc] initWithIdentifier:self.id configurationURL:[NSURL URLWithString:self.url]];
    }
    return [[MGLVectorTileSource alloc] initWithIdentifier:self.id tileURLTemplates:self.tileUrlTemplates options:[self getOptions]];
}

- (nonnull NSArray<id <MGLFeature>> *)featuresInSourceLayersWithIdentifiers:(nonnull NSSet<NSString *> *)sourceLayerIdentifiers predicate:(nullable NSPredicate *)predicate
{
    MGLVectorTileSource* vectorSource = (MGLVectorTileSource*)self.source;
    
    return [vectorSource featuresInSourceLayersWithIdentifiers:sourceLayerIdentifiers predicate: predicate];
}

@end
