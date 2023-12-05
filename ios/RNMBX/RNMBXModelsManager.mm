#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RNMBXModels, RNMBXModelsManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(models, NSDictionary)

@end

