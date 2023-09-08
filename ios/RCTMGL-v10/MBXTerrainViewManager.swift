@objc(MBXTerrainViewManager)
class MBXTerrainViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let terrain = MBXTerrain()
      terrain.bridge = self.bridge
      return terrain
    }
}
