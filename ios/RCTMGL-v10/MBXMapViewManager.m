#import <React/RCTViewManager.h>

// used only to register the view in UIManager and generate view config
// probably can be deleted once static view configs and bridgeless are a thing

@interface MBXMapViewManager : RCTViewManager

@end

@implementation MBXMapViewManager

RCT_EXPORT_MODULE(MBXMapView)

RCT_EXPORT_VIEW_PROPERTY(attributionEnabled, BOOL)

@end
