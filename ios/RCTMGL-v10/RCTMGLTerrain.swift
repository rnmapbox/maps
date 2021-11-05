import MapboxMaps

enum RCTMGLError: Error {
  case parseError(String)
  case failed(String)
}

@objc
class RCTMGLTerrain : UIView, RCTMGLMapComponent, RCTMGLSourceConsumer {
  weak var map : RCTMGLMapView!
  var style : Style! = nil
  
  var bridge : RCTBridge? = nil
  var terrain : Terrain? = nil
  
  @objc var sourceID: String? = nil
  
  @objc var exaggeration : Any? = nil

  func makeTerrain() -> Terrain {
    print("=> sourceID \(sourceID)")
    guard let sourceID = sourceID else {
      Logger.log(level: .error, message: "Terrain should have a sourceID")
      return Terrain(sourceId: "n/a")
    }
    var terrain = Terrain(sourceId: sourceID)
    if let exaggeration = exaggeration {
      do {
        terrain.exaggeration = try toValue(exaggeration)
      } catch {
        Logger.log(level: .error, message: "Faied to parse exaggeration value: \(exaggeration) \(error)")
      }
    }
    
    return terrain
  }
  
  func toValue(_ value: Any) throws -> Value<Double>? {
    if let value = value as? NSNumber {
      return .constant(value.doubleValue)
    } else if let value = value as? [Any] {
      let data = try JSONSerialization.data(withJSONObject: value, options: .prettyPrinted)
      let decodedExpression = try JSONDecoder().decode(Expression.self, from: data)
      return .expression(decodedExpression)
    } else {
      throw RCTMGLError.parseError("failed to parse value")
    }
  }
  
  func addToMap(_ map: RCTMGLMapView, style: Style) {
    self.map = map
    self.style = style
    
    let terrain = self.makeTerrain()
    self.terrain = terrain
    do {
      try style.setTerrain(terrain)
    } catch {
      Logger.log(level:.error, message: "Failed to create terrain: \(terrain)")
    }
  }
  
  func addToMap(_ map: RCTMGLMapView) {
    self.map = map
  
    guard let mapboxMap = map.mapboxMap else {
      return
    }
    
    mapboxMap.onNext(.styleLoaded) {_ in
      let style = mapboxMap.style
 
      do {
        try style.setTerrain(self.makeTerrain())
      } catch {
        Logger.log(level: .error, message: "setTerrain failed: \(error)")
      }
    }
  }
  
  func removeFromMap(_ map: RCTMGLMapView) {
    self.map = nil
    
    guard let mapboxMap = map.mapboxMap else {
      return
    }
    
    let style = mapboxMap.style
    removeFromMap(map, style: style)
  }
  
  func removeFromMap(_ map: RCTMGLMapView, style: Style) {
    try! style.setTerrain(properties: [:])
  }
}
