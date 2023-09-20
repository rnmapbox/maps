#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RNMBXTerrain : UIView
{}
@property (nonatomic) NSObject* exaggeration;
@end

@interface RCT_EXTERN_MODULE(RNMBXTerrainManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(sourceID, NSString);

RCT_EXPORT_VIEW_PROPERTY(reactStyle, NSDictionary);

@end
