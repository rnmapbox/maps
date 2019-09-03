//
//  MGLCustomHeaders.h
//  RCTMGL
//

#import <Foundation/Foundation.h>

@interface NSMutableURLRequest (CustomHeaders)
@end

@interface MGLCustomHeaders : NSObject

@property (nonatomic, strong) NSMutableDictionary<NSString*, NSString*> *currentHeaders;

+ (id)sharedInstance;
- (void)initHeaders;
- (void)addHeader:(NSString*)value forHeaderName:(NSString *)header;
- (void)removeHeader:(NSString *)header;

@end