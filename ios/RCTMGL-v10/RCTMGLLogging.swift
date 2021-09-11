import Foundation
import MapboxMaps

class Logger {
  enum LogLevel : String, Comparable {
    static func < (lhs: Logger.LogLevel, rhs: Logger.LogLevel) -> Bool {
      return lhs.intValue < rhs.intValue
    }
    
    case verbose = "verbose"
    case debug = "debug"
    case info = "info"
    case warn = "warn"
    case error = "error"
  
    var intValue : Int {
      let values : [LogLevel:Int] = [
        .verbose: 0,
        .debug: 1,
        .info: 2,
        .warn: 3,
        .error: 4
      ]
      guard let result = values[self] else {
        fatalError("Unepxected level \(self)")
      }
      return result
    }
    
    var stringValue : String {
      return rawValue
    }
  }
  
  static let sharedInstance = Logger()
  
  var level: LogLevel = .info
  var handler : (LogLevel, String) -> Void = { (level, message) in
    fatalError("Handler not yet installed")
  }
  
  func log(level: LogLevel, message: String) {
    if self.level <= level {
      handler(level, message)
    }
  }
  
  static func log(level: LogLevel, message: String) {
    sharedInstance.log(level: level, message: message)
  }
}

@objc(RCTMGLLogging)
class RCTMGLLogging: RCTEventEmitter {
  static var shared : RCTMGLLogging? = nil
  
  enum ErrorType {
      case argumentError
  }

  @objc
  func setLogLevel(_ logLevel: String) {
    guard let logLevel = Logger.LogLevel(rawValue: logLevel) else {
      fatalError("Unexpected \(logLevel)")
    }
    Logger.sharedInstance.level = logLevel
  }
  
  override init() {
    super.init()
    if let previous = RCTMGLLogging.shared {
      // seems to happen on reload in debug versions
      // fatalError("More than one instance of RCTMGLLogging is created \(previous)")
    }
    RCTMGLLogging.shared = self
    installHandler()
  }

  func installHandler() {
    Logger.sharedInstance.handler = { (level, msg) in
      let body = [
        "level": level.stringValue,
        "message": msg
      ]
      self.sendEvent(withName: "LogEvent", body: body)
    }
  }
  
  @objc
  static override func requiresMainQueueSetup() -> Bool {
      return true
  }
  
  @objc
  override func supportedEvents() -> [String]
  {
      return ["LogEvent"];
  }
}


/*
#import "RCTMGLLogging.h"

@import Mapbox;

@interface RCTMGLLogging()
@property (nonatomic) BOOL hasListeners;
@end

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

- (void)startObserving
{
    [super startObserving];
    self.hasListeners = true;
}

- (void)stopObserving
{
    [super stopObserving];
    self.hasListeners = false;
}

- (void)sendLogWithLevel:(MGLLoggingLevel)loggingLevel filePath:(NSString*)filePath line:(NSUInteger)line message:(NSString*)message
{
    if (!self.hasListeners) return;

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
*/
