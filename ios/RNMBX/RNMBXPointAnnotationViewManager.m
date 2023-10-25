#import "React/RCTBridgeModule.h"
#import <React/RCTViewManager.h>
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_REMAP_MODULE(RNMBXPointAnnotation, RNMBXPointAnnotationViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(coordinate, NSString)
RCT_EXPORT_VIEW_PROPERTY(draggable, BOOL)
RCT_EXPORT_VIEW_PROPERTY(id, NSString)
RCT_EXPORT_VIEW_PROPERTY(anchor, NSDictionary)

RCT_REMAP_VIEW_PROPERTY(onMapboxPointAnnotationDeselected, onDeselected, RCTBubblingEventBlock)
RCT_REMAP_VIEW_PROPERTY(onMapboxPointAnnotationDrag, onDrag, RCTBubblingEventBlock)
RCT_REMAP_VIEW_PROPERTY(onMapboxPointAnnotationDragEnd, onDragEnd, RCTBubblingEventBlock)
RCT_REMAP_VIEW_PROPERTY(onMapboxPointAnnotationDragStart, onDragStart, RCTBubblingEventBlock)
RCT_REMAP_VIEW_PROPERTY(onMapboxPointAnnotationSelected, onSelected, RCTBubblingEventBlock)

@end
