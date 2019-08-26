//
//  MGLCustomHeaders.h
//  RCTMGL
//

#import <Foundation/Foundation.h>

@interface NSMutableURLRequest (CustomHeaders)
@end

@interface MGLCustomHeaders : NSObject

@property (nonatomic, strong) NSMutableDictionary<NSString*, NSString*> *currentHeaders;

+ (void)initHeaders;
+ (id)sharedInstance;
- (void)addHeader:(NSString*)value forHeaderName:(NSString *)header;
- (void)removeHeader:(NSString *)header;

@end