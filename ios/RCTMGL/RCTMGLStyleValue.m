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
    type = (NSString*)config[@"type"];
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
    NSDictionary *rawStops = payload[@"stops"];
    NSNumber *mode = payload[@"mode"];
    NSString *attributeName = payload[@"attributeName"];
    
    NSMutableDictionary<id, id> *stops = nil;
    if (rawStops.count > 0) {
        stops = [[NSMutableDictionary alloc] init];
        
        for (id stopKey in rawStops.allKeys) {
            RCTMGLStyleValue *rctStyleValue = [RCTMGLStyleValue make:rawStops[stopKey]];
            stops[[self _getStopKey:stopKey]] = rctStyleValue.mglStyleValue;
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

- (id)_getStopKey:(id)key
{
    // Javascript does a toString on all keys in it's objects,
    // so we have to attempt to parse any numbers sent down as keys
    NSNumberFormatter *numberFormatter = [[NSNumberFormatter alloc] init];
    NSNumber *numberKey = [numberFormatter numberFromString:key];
    if (numberKey != nil) {
        return numberKey;
    }
    return key;
}

+ (RCTMGLStyleValue*)make:(NSDictionary*)config;
{
    RCTMGLStyleValue *styleValue = [[RCTMGLStyleValue alloc] init];
    styleValue.config = config;
    return styleValue;
}

@end
