@objc(RCTMGLTerrainManager)
class RCTMGLTerrainManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let terrain = RCTMGLTerrain()
      terrain.bridge = self.bridge
      return terrain
    }
}
