import Foundation
import MapboxMaps

@objc(RNMBXPointAnnotationManager)
class RNMBXPointAnnotationManager  : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func view() -> UIView! {
    return RNMBXPointAnnotation()
  }

  @objc
  func refresh(_ reactTag: NSNumber,
    resolver: RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  )
  {
    self.bridge.uiManager.addUIBlock { (manager, viewRegistry) in
      guard let view = viewRegistry?[reactTag] else {
        Logger.log(level: .error, message: "View with tag: \(reactTag) not found")
        return
      }
      guard let view = view as? RNMBXPointAnnotation else {
        Logger.log(level: .error, message: "View \(view) is not RNMBXPointAnnotation")
        return
      }
          
      view.refresh()
    }
  }
}
