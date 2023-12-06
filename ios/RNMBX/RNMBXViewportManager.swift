@objc(RNMBXViewportManager)
public class RNMBXViewportManager : RCTViewManager {
  @objc
  public override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  public override func view() -> UIView! {
    let layer = RNMBXViewport()
    return layer
  }
  
  @objc public static func getState(
      _ view: RNMBXViewport,
      resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock) {
        resolve(view.getState())
  }
  
  @objc public static func idle(
    _ view: RNMBXViewport,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock) {
      resolve(view.idle())
    }
      
  @objc public static func transitionTo(
    _ view: RNMBXViewport,
    state: [String: Any],
    transition: [String: Any],
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    view.transitionTo(state: state, transition: transition) { finished in
      resolve(finished)
    }
  }
}
