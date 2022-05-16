internal extension Encodable {
  func toJSON() throws -> Any {
      return try JSONSerialization.jsonObject(with: JSONEncoder().encode(self))
  }
  
  func toJSON() throws -> [String:Any] {
    let result : Any = try toJSON()
    guard let result = result as? [String:Any] else {
      throw RCTMGLError.paramError("Expected object but got something else: \(result)")
    }
    return result
  }
}
