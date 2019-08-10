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

@implementation RCTMGLVectorSourceManager

RCT_EXPORT_MODULE(RCTMGLVectorSource);

RCT_EXPORT_VIEW_PROPERTY(id, NSString);

- (UIView*)view
{
    return [RCTMGLVectorSource new];
}

RCT_EXPORT_VIEW_PROPERTY(url, NSString);
RCT_EXPORT_VIEW_PROPERTY(hasPressListener, BOOL)
RCT_REMAP_VIEW_PROPERTY(onMapboxVectorSourcePress, onPress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(hitbox, NSDictionary)


RCT_EXPORT_METHOD(features:(nonnull NSNumber*)reactTag
                  withLayerIDs:(NSArray<NSString*>*)layerIDs
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
        // NSPredicate* predicate = [FilterParser parse:filter];
        NSArray<id<MGLFeature>> *shapes = [vectorSource
                                           featuresInSourceLayersWithIdentifiers: layerIDSet
                                           predicate: nil];
        /*
        [reactMapView visibleFeaturesAtPoint:CGPointMake([point[0] floatValue], [point[1] floatValue])
                                                  inStyleLayersWithIdentifiers:layerIDSet
                                                                     predicate:predicate];*/
        
        
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
