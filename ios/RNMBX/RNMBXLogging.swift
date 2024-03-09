import Foundation
import MapboxMaps

public enum RNMBXError: Error, LocalizedError {
  case parseError(String)
  case failed(String)
  case paramError(String)

  public var errorDescription: String? {
    return String(describing: self)
  }
}

public class Logger {
  public enum LogLevel: String, Comparable {
    public static func < (lhs: Logger.LogLevel, rhs: Logger.LogLevel) -> Bool {
      return lhs.intValue < rhs.intValue
    }
    
    case verbose = "verbose"
    case debug = "debug"
    case info = "info"
    case warn = "warning"
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
  
  internal static let sharedInstance = Logger()
  
  fileprivate var level: LogLevel = .info
  fileprivate var handler: (LogLevel, String) -> Void = { (level, message) in
    fatalError("Handler not yet installed")
  }
  
  public func log(level: LogLevel, tag: String, message: String) {
    log(level: level, message: "\(tag) | \(message)")
  }
    
  @available(*, deprecated, message: "Use log(level:tag:message:) instead.")
  public func log(level: LogLevel, message: String) {
    print("\(level) | \(message)")
    if self.level <= level {
      handler(level, message)
    }
  }
  
  public static func log(level: LogLevel, tag: String, message: String, error: Error? = nil) {
    if let error = error {
      sharedInstance.log(level: level, message: "\(tag) | \(message), \(error.localizedDescription), \(error)")
    } else {
      sharedInstance.log(level: level, message: "\(tag) | \(message)")
    }
  }
  
  @available(*, deprecated, message: "Use log(level:tag:message:error:) instead.")
  public static func log(level: LogLevel, message: String, error: Error? = nil) {
    if let error = error {
      sharedInstance.log(level: level, message: "\(message), \(error.localizedDescription), \(error)")
    } else {
      sharedInstance.log(level: level, message: message)
    }
  }
  
  public static func error(_ tag: String, _ message: String) {
    log(level: .error, tag: tag, message: message)
  }

  public static func error(_ message: String) {
    log(level: .error, message: message)
  }

  public static func assert(_ message: String) {
    log(level: .error, message: "Assertion failure: \(message)")
  }
}

/// Logs tag and message if `fn` throws and returns nil
public func logged<T>(_ tag: String, _ msg: String, info: (() -> String)? = nil, level: Logger.LogLevel = .error, rejecter: RCTPromiseRejectBlock? = nil, fn: () throws -> T) -> T? {
  logged(
    "\(tag) | \(msg)",
    info: info,
    level: level,
    rejecter: rejecter, 
    fn: fn
  )
}

/// Logs tag and message if `fn` returns nil
public func logged<T>(_ tag: String, _ msg: String, info: (() -> String)? = nil, level: Logger.LogLevel = .error, rejecter: RCTPromiseRejectBlock? = nil, fn: () -> T) -> T? {
  logged(
    "\(tag) | \(msg)",
    info: info,
    level: level,
    rejecter: rejecter, 
    fn: fn
  )
}

@available(*, deprecated, message: "Use logged(tag:msg:info:level:rejecter:fn:) instead.")
public func logged<T>(_ msg: String, info: (() -> String)? = nil, level: Logger.LogLevel = .error, rejecter: RCTPromiseRejectBlock? = nil, fn: () throws -> T) -> T? {
  do {
    return try fn()
  } catch {
    let _info = info?() ?? ""
    let _error = errorMessage(error)
    Logger.log(level: level, message: "\(msg) \(_info) \(_error)")
    rejecter?(msg, "\(_info) \(_error)", error)
    return nil
  }
}

@available(*, deprecated, message: "Use logged(tag:msg:info:level:rejecter:fn:) instead.")
public func logged<T>(_ msg: String, info: (() -> String)? = nil, level: Logger.LogLevel = .error, rejecter: RCTPromiseRejectBlock? = nil, fn: () -> T?) ->T? {
  if let ret = fn() {
    return ret
  } else {
    let _info = info?() ?? ""
    Logger.log(level: level, message: "\(msg) \(_info)")
    rejecter?(msg, _info, NSError(domain: "is null", code: 0))
    return nil
  }
}

@available(*, deprecated, message: "Use logged(tag:msg:info:level:rejecter:fn:) instead.")
public func logged<T>(_ msg: String, info: (() -> String)? = nil, errorResult: (Error) -> T, level: Logger.LogLevel = .error, fn: () throws -> T) -> T {
  do {
    return try fn()
  } catch {
    let _info = info?() ?? ""
    Logger.log(level: level, message: "\(msg) \(_info) \(error.localizedDescription)")
    return errorResult(error)
  }
}

private func errorMessage(_ error: Error) -> String {
  if case DecodingError.typeMismatch(let _, let context) = error {
    return "\(error.localizedDescription) \(context.codingPath) \(context.debugDescription)"
  } else if let mapError = error as? MapError {
    return "MapError: \(mapError.errorDescription)"
  } else {
    return "\(error.localizedDescription)"
  }
}

@objc(RNMBXLogger)
public class RNMBXLogger : NSObject {
  @objc
  static public func error(_ message: String) {
    Logger.error(message)
  }
}

@objc(RNMBXLogging)
class RNMBXLogging: RCTEventEmitter {
  static var shared : RNMBXLogging? = nil
  
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
    if let _ = RNMBXLogging.shared {
      // seems to happen on reload in debug versions
      // fatalError("More than one instance of RNMBXLogging is created \(previous)")
    }
    RNMBXLogging.shared = self
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
  override func supportedEvents() -> [String] {
      return ["LogEvent"];
  }
}
