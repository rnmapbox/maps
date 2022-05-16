import Foundation
import MapboxMaps

enum RCTMGLError: Error, LocalizedError {
  case parseError(String)
  case failed(String)
  case paramError(String)

  var errorDescription: String? {
    return String(describing: self)
  }
}

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
    print("LOG \(level) \(message)")
    if self.level <= level {
      handler(level, message)
    }
  }
  
  static func log(level: LogLevel, message: String) {
    sharedInstance.log(level: level, message: message)
  }
  
  static func log(level: LogLevel, message: String, error: Error) {
    sharedInstance.log(level: level, message: "\(message) - error: \(error.localizedDescription) \(error)")
  }
}

func logged<T>(_ msg: String, info: (() -> String)? = nil, level: Logger.LogLevel = .error, rejecter: RCTPromiseRejectBlock? = nil, fn : () throws -> T) -> T? {
  do {
    return try fn()
  } catch {
    Logger.log(level:level, message: "\(msg) \(info?() ?? "") \(error.localizedDescription)")
    rejecter?(msg, "\(info?() ?? "") \(error.localizedDescription)", error)
    return nil
  }
}

func logged<T>(_ msg: String, info: (() -> String)? = nil, errorResult: (Error) -> T, level: Logger.LogLevel = .error, fn : () throws -> T) -> T {
  do {
    return try fn()
  } catch {
    Logger.log(level:level, message: "\(msg) \(info?() ?? "") \(error.localizedDescription)")
    return errorResult(error)
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
    if let _ = RCTMGLLogging.shared {
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
