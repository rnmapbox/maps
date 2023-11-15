import MapboxMaps

internal extension CLLocationCoordinate2D {
  private func doValidate() -> Result<Void,Error> {
    if latitude < -90.0 || latitude > 90.0 {
      return .failure(RNMBXError.paramError("latitude should be between -90 and 90 but it was \(latitude)"))
    }
    
    return .success(())
  }

  func validate() throws {
    switch doValidate() {
    case .success():
      return
    case .failure(let error):
      throw error
    }
  }

  func isValid() -> Bool {
    switch doValidate() {
    case .success():
      return true
    case .failure(_):
      return false
    }
  }
}