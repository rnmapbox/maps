//
//  RCTMGLEvent.m
//  RCTMGL
//
//  Created by Nick Italiano on 8/25/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import "RCTMGLEvent.h"

@implementation RCTMGLEvent

- (NSDictionary*)payload
{
    if (_payload == nil) {
        return @{};
    }
    return _payload;
}

- (NSDictionary*)toJSON
{
    return @{ @"type": self.type, @"payload": self.payload };
}

+ (RCTMGLEvent*)makeEvent:(NSString*)type
{
    return [RCTMGLEvent makeEvent:type withPayload:@{}];
}

+ (RCTMGLEvent*)makeEvent:(NSString*)type withPayload:(NSDictionary*)payload
{
    RCTMGLEvent *event = [[RCTMGLEvent alloc] init];
    event.type = type;
    event.payload = payload;
    return event;
}

@end
