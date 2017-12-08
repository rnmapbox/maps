//
//  RCTMGLStyleValue.h
//  RCTMGL
//
//  Created by Nick Italiano on 9/11/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
@import Mapbox;

@interface RCTMGLStyleValue : NSObject

@property (nonatomic, strong) NSDictionary *config;

@property (nonatomic, readonly) NSString *type;
@property (nonatomic, readonly) NSDictionary *payload;
@property (nonatomic, readonly) id mglStyleValue;

- (BOOL)isFunction;
- (BOOL)isFunctionTypeSupported:(NSArray<NSString*>*)allowedFunctionTypes;
- (MGLTransition)getTransition;
- (MGLStyleValue*)getSphericalPosition;
- (BOOL)isVisible;

+ (RCTMGLStyleValue*)make:(NSDictionary*)config;

@end
