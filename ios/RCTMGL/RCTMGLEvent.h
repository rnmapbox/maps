//
//  RCTMGLEvent.h
//  RCTMGL
//
//  Created by Nick Italiano on 8/25/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RCTMGLEventProtocol.h"

@interface RCTMGLEvent : NSObject<RCTMGLEventProtocol>

@property (nonatomic, copy) NSString *type;
@property (nonatomic, strong) NSDictionary *payload;
@property (nonatomic, readonly) NSTimeInterval timestamp;

+ (RCTMGLEvent*)makeEvent:(NSString*)eventType;
+ (RCTMGLEvent*)makeEvent:(NSString*)eventType withPayload:(NSDictionary*)payload;

@end
