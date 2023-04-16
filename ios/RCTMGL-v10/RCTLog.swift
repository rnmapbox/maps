func RCTMGLLogError(_ message: String, _ file: String = #file, _ line: UInt = #line) {
  RCTMGLSwiftLog.error(message, file: file, line: line)
}

func RCTMGLLogWarn(_ message: String, _ file: String = #file, _ line: UInt = #line) {
  RCTMGLSwiftLog.warn(message, file: file, line: line)
}

func RCTMGLLogInfo(_ message: String, _ file: String = #file, _ line: UInt = #line) {
  RCTMGLSwiftLog.info(message, file: file, line: line)
}

func RCTMGLLog(_ message: String, _ file: String = #file, _ line: UInt = #line) {
  RCTMGLSwiftLog.log(message, file: file, line: line)
}

func RCTMGLLogTrace(_ message: String, _ file: String = #file, _ line: UInt = #line) {
  RCTMGLSwiftLog.trace(message, file: file, line: line)
}
