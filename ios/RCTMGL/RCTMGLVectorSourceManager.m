//
//  RCTMGLVectorSourceManager.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/8/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <React/RCTUIManager.h>

#import "RCTMGLVectorSourceManager.h"
#import "RCTMGLVectorSource.h"

#import "FilterParser.h"

@implementation RCTMGLVectorSourceManager

RCT_EXPORT_MODULE(RCTMGLVectorSource);

RCT_EXPORT_VIEW_PROPERTY(id, NSString);

- (UIView*)view
{
    return [RCTMGLVectorSource new];
}

RCT_EXPORT_VIEW_PROPERTY(url, NSString)
RCT_EXPORT_VIEW_PROPERTY(tileUrlTemplates, NSArray)
RCT_EXPORT_VIEW_PROPERTY(attribution, NSString)

RCT_EXPORT_VIEW_PROPERTY(minZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(maxZoomLevel, NSNumber)

RCT_EXPORT_VIEW_PROPERTY(tms, BOOL)
RCT_EXPORT_VIEW_PROPERTY(hasPressListener, BOOL)
RCT_REMAP_VIEW_PROPERTY(onMapboxVectorSourcePress, onPress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(hitbox, NSDictionary)


RCT_EXPORT_METHOD(features:(nonnull NSNumber*)reactTag
                  withLayerIDs:(NSArray<NSString*>*)layerIDs
                  withFilter:(NSArray<NSDictionary<NSString *, id> *> *)filter
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *manager, NSDictionary<NSNumber*, UIView*> *viewRegistry) {
        RCTMGLVectorSource* vectorSource = viewRegistry[reactTag];
        
        if (![vectorSource isKindOfClass:[RCTMGLVectorSource class]]) {
            RCTLogError(@"Invalid react tag, could not find RCTMGLMapView");
            return;
        }

        NSSet* layerIDSet = nil;
        if (layerIDs != nil && layerIDs.count > 0) {
            layerIDSet = [NSSet setWithArray:layerIDs];
        }
        NSPredicate* predicate = [FilterParser parse:filter];
        NSArray<id<MGLFeature>> *shapes = [vectorSource
                                           featuresInSourceLayersWithIdentifiers: layerIDSet
                                           predicate: predicate];
        
        NSMutableArray<NSDictionary*> *features = [[NSMutableArray alloc] initWithCapacity:shapes.count];
        for (int i = 0; i < shapes.count; i++) {
            [features addObject:shapes[i].geoJSONDictionary];
        }
        
        resolve(@{
                  @"data": @{ @"type": @"FeatureCollection", @"features": features }
                  });
    }];
}

RCT_EXPORT_METHOD(addEvent:(NSString *)name location:(NSString *)location)
{
    RCTLogInfo(@"Pretending to create an event %@ at %@", name, location);
}

@end
