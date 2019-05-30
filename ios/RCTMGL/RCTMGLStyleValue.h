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

@property (nonatomic, strong) NSString *styleType;
@property (nonatomic, strong) NSDictionary *rawStyleValue;
@property (nonatomic, readonly) NSExpression *mglStyleValue;

- (BOOL)shouldAddImage;
- (NSString *)getImageURI;
- (double)getImageScale;
- (MGLTransition)getTransition;
- (NSExpression *)getSphericalPosition;
- (BOOL)isVisible;

+ (RCTMGLStyleValue*)make:(NSString*)expressionJSONStr;

@end
