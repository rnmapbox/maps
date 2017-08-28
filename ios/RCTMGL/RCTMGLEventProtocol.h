//
//  RCTMGLEvent.h
//  RCTMGL
//
//  Created by Nick Italiano on 8/25/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

@protocol RCTMGLEventProtocol <NSObject>

@property (nonatomic, copy) NSString *type;
@property (nonatomic, strong) NSDictionary *payload;

- (NSDictionary*)toJSON;

@end
