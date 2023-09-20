#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>


@interface RCTConvert (NSNumberArrayArray)

+ (NSArray<NSArray<NSNumber*>*> *)NSNumberArrayArray:(id)json;

@end

@implementation RCTConvert (NSNumberArrayArray)

+(NSArray<NSArray<NSNumber*>*> *)NSNumberArrayArray : (id)json RCT_DYNAMIC
{
  return json;
}

@end


@interface RCT_EXTERN_MODULE(RNMBXImageManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(stretchX, NSArray<NSArray<NSNumber*>>)
RCT_EXPORT_VIEW_PROPERTY(stretchY, NSArray<NSArray<NSNumber*>>)
RCT_EXPORT_VIEW_PROPERTY(content, NSArray<NSNumber*>)
RCT_EXPORT_VIEW_PROPERTY(sdf, BOOL)
RCT_EXPORT_VIEW_PROPERTY(name, NSString)

@end

