//
//  RCTMGLVectorSource.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/8/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLTileSource.h"
@import Mapbox;

@interface RCTMGLVectorSource : RCTMGLTileSource

- (nonnull NSArray<id <MGLFeature>> *)featuresInSourceLayersWithIdentifiers:(nonnull NSSet<NSString *> *)sourceLayerIdentifiers predicate:(nullable NSPredicate *)predicate;

@end
