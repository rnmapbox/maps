//
//  RCTMGLVectorSource.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/8/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLSource.h"
@import Mapbox;

@interface RCTMGLVectorSource : RCTMGLSource

@property (nonatomic, copy) NSString *url;

- (NSArray<id <MGLFeature>> *)featuresInSourceLayersWithIdentifiers:(NSSet<NSString *> *)sourceLayerIdentifiers predicate:(nullable NSPredicate *)predicate;

@end
