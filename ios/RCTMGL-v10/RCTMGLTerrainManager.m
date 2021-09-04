#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCTMGLTerrain : UIView
{}
@property (nonatomic) NSObject* exaggeration;
@end

@interface RCT_EXTERN_MODULE(RCTMGLTerrainManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(sourceID, NSString);

RCT_CUSTOM_VIEW_PROPERTY(exaggeration, NSObject, RCTMGLTerrain) {
  view.exaggeration = json;
}
@end
