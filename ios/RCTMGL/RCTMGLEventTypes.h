//
//  RCTMGLEventTypes.h
//  RCTMGL
//
//  Created by Nick Italiano on 8/27/17.
//  Copyright © 2017 Mapbox Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface RCTMGLEventTypes : NSObject

extern NSString *const RCT_MAPBOX_EVENT_TAP;
extern NSString *const RCT_MAPBOX_EVENT_LONGPRESS;

extern NSString *const RCT_MAPBOX_USER_LOCATION_UPDATE;
extern NSString *const RCT_MAPBOX_USER_TRACKING_MODE_CHANGE;

extern NSString *const RCT_MAPBOX_REGION_WILL_CHANGE_EVENT;
extern NSString *const RCT_MAPBOX_REGION_IS_CHANGING;
extern NSString *const RCT_MAPBOX_REGION_DID_CHANGE;

extern NSString *const RCT_MAPBOX_WILL_START_LOADING_MAP;
extern NSString *const RCT_MAPBOX_DID_FINISH_LOADING_MAP;
extern NSString *const RCT_MAPBOX_DID_FAIL_LOADING_MAP;

extern NSString *const RCT_MAPBOX_WILL_START_RENDERING_FRAME;
extern NSString *const RCT_MAPBOX_DID_FINSIH_RENDERING_FRAME;
extern NSString *const RCT_MAPBOX_DID_FINISH_RENDERING_FRAME_FULLY;

extern NSString *const RCT_MAPBOX_WILL_START_RENDERING_MAP;
extern NSString *const RCT_MAPBOX_DID_FINISH_RENDERING_MAP;
extern NSString *const RCT_MAPBOX_DID_FINISH_RENDERING_MAP_FULLY;

extern NSString *const RCT_MAPBOX_DID_FINISH_LOADING_STYLE;

extern NSString *const RCT_MAPBOX_ANNOTATION_TAP;

extern NSString *const RCT_MAPBOX_OFFLINE_PROGRESS;
extern NSString *const RCT_MAPBOX_OFFLINE_ERROR;
extern NSString *const RCT_MAPBOX_OFFLINE_TILE_LIMIT;

extern NSString *const RCT_MAPBOX_SHAPE_SOURCE_LAYER_PRESS;
extern NSString *const RCT_MAPBOX_VECTOR_SOURCE_LAYER_PRESS;
@end
