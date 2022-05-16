internal extension DefaultStringInterpolation {
  mutating func appendInterpolation<T>(optional: T?) {
    appendInterpolation(String(describing: optional))
  }
}