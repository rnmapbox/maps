#import "React/RCTBridgeModule.h"
#import <React/RCTViewManager.h>
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_REMAP_MODULE(RCTMGLPointAnnotation, RCTMGLPointAnnotationManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(coordinate, NSString)

RCT_EXTERN_METHOD(refresh:(nonnull NSNumber*)reactTag
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end

