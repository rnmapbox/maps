@objc(RNMBXTerrainManager)
class RNMBXTerrainManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let terrain = RNMBXTerrain()
      terrain.bridge = self.bridge
      return terrain
    }
}
