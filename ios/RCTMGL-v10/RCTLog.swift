func RCTLogError(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RCTMGLSwiftLog.error(message, file: file, line: line)
}

func RCTLogWarn(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RCTMGLSwiftLog.warn(message, file: file, line: line)
}

func RCTLogInfo(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RCTMGLSwiftLog.info(message, file: file, line: line)
}

func RCTLog(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RCTMGLSwiftLog.log(message, file: file, line: line)
}

func RCTLogTrace(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RCTMGLSwiftLog.trace(message, file: file, line: line)
}