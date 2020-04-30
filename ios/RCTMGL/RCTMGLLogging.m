#import "RCTMGLLogging.h"

@import Mapbox;

@implementation RCTMGLLogging

+ (id)allocWithZone:(NSZone *)zone {
    static RCTMGLLogging *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [super allocWithZone:zone];
    });
    return sharedInstance;
}

-(id)init {
    if ( self = [super init] ) {
        self.loggingConfiguration = [MGLLoggingConfiguration sharedConfiguration];
        [self.loggingConfiguration  setLoggingLevel:MGLLoggingLevelWarning];
        __weak typeof(self) weakSelf = self;
        self.loggingConfiguration.handler = ^(MGLLoggingLevel loggingLevel, NSString *filePath, NSUInteger line, NSString *message) {
            [weakSelf sendLogWithLevel:loggingLevel filePath: filePath line: line message: message];
        };
    }
    return self;
}

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"LogEvent"];
}

- (void)sendLogWithLevel:(MGLLoggingLevel)loggingLevel filePath:(NSString*)filePath line:(NSUInteger)line message:(NSString*)message
{
    NSString* level = @"n/a";
    switch (loggingLevel) {
    case MGLLoggingLevelInfo:
        level = @"info";
        break;
    case MGLLoggingLevelError:
        level = @"error";
        break;
#if MGL_LOGGING_ENABLE_DEBUG
    case MGLLoggingLevelDebug:
        level = @"debug";
        break;
#endif
    case MGLLoggingLevelWarning:
        level = @"warning";
        break;
    case MGLLoggingLevelNone:
        level = @"none";
        break;
    case MGLLoggingLevelFault:
        level = @"fault";
        break;
    case MGLLoggingLevelVerbose:
        level = @"verbose";
        break;
    }

    NSString* type = nil;
    if ([message hasPrefix:@"Failed to load glyph range"]) {
        type = @"missing_font";
    }

    NSMutableDictionary* body = [@{
        @"level": level,
        @"message": message,
        @"filePath": filePath,
        @"line": @(line)
    } mutableCopy];

    if (type != nil) {
        body[@"type"] = type;
    }
    [self sendEventWithName:@"LogEvent" body:body];
}

RCT_EXPORT_METHOD(setLogLevel: (nonnull NSString*)logLevel)
{
    MGLLoggingLevel mglLogLevel = MGLLoggingLevelNone;
    if ([logLevel isEqualToString:@"none"]) {
        mglLogLevel = MGLLoggingLevelNone;
    } else if ([logLevel isEqualToString:@"debug"]) {
        mglLogLevel = MGLLoggingLevelInfo;
    } else if ([logLevel isEqualToString:@"fault"]) {
        mglLogLevel = MGLLoggingLevelFault;
    } else if ([logLevel isEqualToString:@"error"]) {
        mglLogLevel = MGLLoggingLevelError;
    } else if ([logLevel isEqualToString:@"warning"]) {
        mglLogLevel = MGLLoggingLevelWarning;
    } else if ([logLevel isEqualToString:@"info"]) {
        mglLogLevel = MGLLoggingLevelInfo;
    } else if ([logLevel isEqualToString:@"debug"]) {
#if MGL_LOGGING_ENABLE_DEBUG
        mglLogLevel = MGLLoggingLevelDebug;
#else
        mglLogLevel = MGLLoggingLevelVerbose;
#endif
    } else if ([logLevel isEqualToString:@"verbose"]) {
        mglLogLevel = MGLLoggingLevelVerbose;
    }
    self.loggingConfiguration.loggingLevel = mglLogLevel;
}

@end
