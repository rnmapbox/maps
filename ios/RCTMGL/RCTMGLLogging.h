#ifndef RCTMGLLogging_h
#define RCTMGLLogging_h

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>


@class MGLLoggingConfiguration;

@interface RCTMGLLogging : RCTEventEmitter <RCTBridgeModule>

@property (nonatomic, nonnull) MGLLoggingConfiguration*  loggingConfiguration;

- (void)setLoggingLevel:(nonnull NSString*) logLevel;

@end

#endif /* RCTMGLLogging_h */
