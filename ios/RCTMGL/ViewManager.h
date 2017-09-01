//
//  ViewManager.h
//  RCTMGL
//
//  Created by Nick Italiano on 8/31/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <React/RCTViewManager.h>
#import "RCTMGLEvent.h"

@interface ViewManager : RCTViewManager

-(void)fireEvent:(RCTMGLEvent*)event withCallback:(RCTBubblingEventBlock)callback;

@end
