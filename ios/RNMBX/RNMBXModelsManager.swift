@objc(RNMBXModelsManager)
public class RNMBXModelsManager : RCTViewManager {
  @objc
  public override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  public override func view() -> UIView! {
    let layer = RNMBXModels()
    return layer
  }
}

