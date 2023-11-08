#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(RNMBXStyleImport, RNMBXStyleImportManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(id, NSString)
RCT_EXPORT_VIEW_PROPERTY(existing, BOOL)
RCT_EXPORT_VIEW_PROPERTY(config, NSDictionary)

@end
