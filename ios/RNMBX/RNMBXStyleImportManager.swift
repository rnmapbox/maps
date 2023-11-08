@objc(RNMBXStyleImportManager)
class RNMBXStyleImportManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    let layer = RNMBXStyleImport()
    return layer
  }
}
