func RNMBXLogError(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RNMBXSwiftLog.error(message, file: file, line: line)
}

func RNMBXLogWarn(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RNMBXSwiftLog.warn(message, file: file, line: line)
}

func RNMBXLogInfo(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RNMBXSwiftLog.info(message, file: file, line: line)
}

func RNMBXLog(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RNMBXSwiftLog.log(message, file: file, line: line)
}

func RNMBXLogTrace(_ message: String, _ file: String=#file, _ line: UInt=#line) {
  RNMBXSwiftLog.trace(message, file: file, line: line)
}