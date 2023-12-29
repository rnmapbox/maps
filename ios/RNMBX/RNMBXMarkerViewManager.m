#import "React/RCTBridgeModule.h"
#import <React/RCTViewManager.h>
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_REMAP_MODULE(RNMBXMarkerView, RNMBXMarkerViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(coordinate, NSArray)
RCT_EXPORT_VIEW_PROPERTY(anchor, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(allowOverlap, BOOL)
RCT_EXPORT_VIEW_PROPERTY(allowOverlapWithPuck, BOOL)
RCT_EXPORT_VIEW_PROPERTY(isSelected, BOOL)

@end
