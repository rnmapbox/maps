//
//  RCTMGLShapeSourceManager.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/19/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//
#import <React/RCTUIManager.h>

#import "RCTMGLShapeSourceManager.h"
#import "RCTMGLShapeSource.h"

#import "FilterParser.h"

@implementation RCTMGLShapeSourceManager

RCT_EXPORT_MODULE(RCTMGLShapeSource)

RCT_EXPORT_VIEW_PROPERTY(id, NSString)
RCT_EXPORT_VIEW_PROPERTY(url, NSString)
RCT_EXPORT_VIEW_PROPERTY(shape, NSString)

RCT_EXPORT_VIEW_PROPERTY(cluster, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(clusterRadius, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(clusterMaxZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(maxZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(buffer, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(tolerance, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(images, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(nativeImages, NSArray)
RCT_EXPORT_VIEW_PROPERTY(hasPressListener, BOOL)
RCT_EXPORT_VIEW_PROPERTY(hitbox, NSDictionary)
RCT_REMAP_VIEW_PROPERTY(onMapboxShapeSourcePress, onPress, RCTBubblingEventBlock)

- (UIView*)view
{
    RCTMGLShapeSource *source = [RCTMGLShapeSource new];
    source.bridge = self.bridge;
    return source;
}

RCT_EXPORT_METHOD(features:(nonnull NSNumber*)reactTag
                  withFilter:(NSArray *)filter
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *manager, NSDictionary<NSNumber*, UIView*> *viewRegistry) {
        RCTMGLShapeSource* shapeSource = viewRegistry[reactTag];
        
        if (![shapeSource isKindOfClass:[RCTMGLShapeSource class]]) {
            RCTLogError(@"Invalid react tag, could not find RCTMGLMapView");
            return;
        }

        NSPredicate* predicate = [FilterParser parse:filter];
        NSArray<id<MGLFeature>> *shapes = [shapeSource featuresMatchingPredicate: predicate];
        
        NSMutableArray<NSDictionary*> *features = [[NSMutableArray alloc] initWithCapacity:shapes.count];
        for (int i = 0; i < shapes.count; i++) {
            [features addObject:shapes[i].geoJSONDictionary];
        }
        
        resolve(@{
                  @"data": @{ @"type": @"FeatureCollection", @"features": features }
                  });
    }];
}

RCT_EXPORT_METHOD(getClusterLeaves:(nonnull NSNumber*)reactTag
                  clusterId:(nonnull NSNumber *)clusterId
                  number:(NSUInteger) number
                  offset:(NSUInteger) offset
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *manager, NSDictionary<NSNumber*, UIView*> *viewRegistry) {
        RCTMGLShapeSource* shapeSource = viewRegistry[reactTag];
        
        if (![shapeSource isKindOfClass:[RCTMGLShapeSource class]]) {
            RCTLogError(@"Invalid react tag, could not find RCTMGLMapView");
            return;
        }

        NSArray<id<MGLFeature>> *shapes = [shapeSource getClusterLeaves:clusterId number:number offset:offset];
        
        NSMutableArray<NSDictionary*> *features = [[NSMutableArray alloc] initWithCapacity:shapes.count];
        for (int i = 0; i < shapes.count; i++) {
            [features addObject:shapes[i].geoJSONDictionary];
        }
        
        resolve(@{
                  @"data": @{ @"type": @"FeatureCollection", @"features": features }
                  });
    }];
}

@end
