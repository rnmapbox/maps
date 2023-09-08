#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface MBXTerrain : UIView
{}
@property (nonatomic) NSObject* exaggeration;
@end

@interface RCT_EXTERN_REMAP_MODULE(MBXTerrain, MBXTerrainViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(sourceID, NSString);

RCT_EXPORT_VIEW_PROPERTY(reactStyle, NSDictionary);

@end
