//
//  RCTMGLStyleValue.m
//  RCTMGL
//
//  Created by Nick Italiano on 9/11/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLStyleValue.h"
#import "RCTMGLUtils.h"
#import <React/RCTImageLoader.h>

@implementation RCTMGLStyleValue
{
    NSString *type;
    NSDictionary *payload;
}

- (void)setConfig:(NSDictionary *)config
{
    _config = config;
    type = (NSString*)config[@"styletype"];
    payload = (NSDictionary*)config[@"payload"];
}

- (NSString*)type
{
    return type;
}

- (NSDictionary*)payload
{
    return payload;
}

- (id)mglStyleValue
{
    if ([self isFunction]) {
        return [self makeStyleFunction];
    }
    
    id rawValue = self.payload[@"value"];
    
    if ([self.type isEqualToString:@"color"]) {
        rawValue = [RCTMGLUtils toColor:rawValue];
    } else if ([self.type isEqualToString:@"translate"]) {
        rawValue = [NSValue valueWithCGVector:[RCTMGLUtils toCGVector:rawValue]];
    }

    // check for overrides that handle special cases like NSArray vs CGVector
    NSDictionary *iosTypeOverride = self.payload[@"iosType"];
    if (iosTypeOverride != nil) {
        if ([iosTypeOverride isEqual:@"vector"]) {
            rawValue = [NSValue valueWithCGVector:[RCTMGLUtils toCGVector:rawValue]];
        } else if ([iosTypeOverride isEqual:@"edgeinsets"]){
            rawValue = [NSValue valueWithUIEdgeInsets:[RCTMGLUtils toUIEdgeInsets:rawValue]];
        }
    }
    
    id propertyValue = self.payload[@"propertyValue"];
    if (propertyValue != nil) {
        return @{ propertyValue: [MGLStyleValue valueWithRawValue:rawValue] };
    }
    
    return [MGLStyleValue valueWithRawValue:rawValue];
}

- (BOOL)isFunction
{
    return [type isEqualToString:@"function"];
}

- (BOOL)isTranslation
{
    return [type isEqualToString:@"translate"];
}

- (BOOL)isFunctionTypeSupported:(NSArray<NSString *> *)allowedFunctionTypes
{
    NSString *fnType = (NSString*)payload[@"fn"];
    
    for (NSString *curFnType in allowedFunctionTypes) {
        if ([curFnType isEqualToString:fnType]) {
            return YES;
        }
    }
    
    return NO;
}

- (MGLStyleValue*)makeStyleFunction
{
    NSString *fnType = (NSString*)payload[@"fn"];
    NSArray<NSArray<NSDictionary *> *> *rawStops = payload[@"stops"];
    NSNumber *mode = payload[@"mode"];
    NSString *attributeName = payload[@"attributeName"];
    
    NSMutableDictionary<id, id> *stops = nil;
    if (rawStops.count > 0) {
        stops = [[NSMutableDictionary alloc] init];
        
        for (NSArray *rawStop in rawStops) {
            NSDictionary *jsStopKey = rawStop[0];
            NSDictionary *jsStopValue = rawStop[1];
            RCTMGLStyleValue *rctStyleValue = [RCTMGLStyleValue make:jsStopValue];
            stops[[self _getStopKey:jsStopKey]] = rctStyleValue.mglStyleValue;
        }
    }
    
    MGLInterpolationMode interpolationMode = [mode integerValue];
    if ([fnType isEqualToString:@"camera"]) {
        return [MGLStyleValue valueWithInterpolationMode:interpolationMode
                              cameraStops:stops
                              options:nil];
    } else if ([fnType isEqualToString:@"source"]) {
        return [MGLStyleValue valueWithInterpolationMode:interpolationMode
                              sourceStops:stops
                              attributeName:attributeName
                              options:nil];
    } else if ([fnType isEqualToString:@"composite"]) {
        return [MGLStyleValue valueWithInterpolationMode:interpolationMode
                              compositeStops:stops
                              attributeName:attributeName
                              options:nil];
    } else {
        return nil;
    }
}

- (MGLTransition)getTransition
{
    if (![self.type isEqualToString:@"transition"]) {
        return MGLTransitionMake(0, 0);
    }
    
    NSDictionary *config = self.payload[@"value"];
    if (config == nil) {
        return MGLTransitionMake(0, 0);
    }
    
    NSNumber *duration = config[@"duration"];
    NSNumber *delay = config[@"delay"];
    
    return MGLTransitionMake([duration doubleValue], [delay doubleValue]);
}

- (MGLStyleValue*)getSphericalPosition
{
    NSArray<NSNumber*> *values = self.payload[@"value"];
    
    CGFloat radial = [values[0] floatValue];
    CLLocationDistance azimuthal = [values[1] doubleValue];
    CLLocationDistance polar = [values[2] doubleValue];
    
    MGLSphericalPosition pos = MGLSphericalPositionMake(radial, azimuthal, polar);
    return [MGLStyleValue valueWithRawValue:[NSValue valueWithMGLSphericalPosition:pos]];
}

- (BOOL)isVisible
{
    id value = self.payload[@"value"];
    if (![value isKindOfClass:[NSString class]]) {
        return NO;
    }
    return [value isEqualToString:@"visible"];
}

- (id)_getStopKey:(NSDictionary *)jsStopKey
{
    NSString *payloadKey = @"value";
    NSString *type = jsStopKey[@"type"];
    
    if ([type isEqualToString:@"number"]) {
        return (NSNumber *)jsStopKey[payloadKey];
    } else if ([type isEqualToString:@"boolean"]) {
        return [NSNumber numberWithBool:jsStopKey[payloadKey]];
    } else {
        return (NSString *)jsStopKey[payloadKey];
    }
}

+ (RCTMGLStyleValue*)make:(NSDictionary*)config;
{
    RCTMGLStyleValue *styleValue = [[RCTMGLStyleValue alloc] init];
    styleValue.config = config;
    return styleValue;
}

@end
