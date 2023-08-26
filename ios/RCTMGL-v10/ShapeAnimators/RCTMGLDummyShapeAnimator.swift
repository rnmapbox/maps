import MapboxMaps

protocol AnimatedShapeConsumer: RCTMGLMapComponent {
  func initialShape(shape: GeoJSONObject)
  func updateShape(shape: GeoJSONObject)
}

class RCTMGLDummyShapeAnimator: UIView, RCTMGLMapComponent {
  var consumers: [AnimatedShapeConsumer] = []
  
  var timerAnimations : [(AnimatedShapeConsumer, Timer)] = [];
  
  func addToMap(_ map: RCTMGLMapView, style: Style) {
    consumers.forEach { $0.addToMap(map, style: style) }
  }
  
  func removeFromMap(_ map: RCTMGLMapView, reason: RemovalReason) -> Bool {
    var allRemoved = false
    consumers.forEach {
      if $0.removeFromMap(map, reason: reason) {
      } else {
        allRemoved = false
      }
    }
    return allRemoved
  }
  
  func waitForStyleLoad() -> Bool {
    return true
  }
  
  @objc open override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    if let shapeConsumer = subview as? AnimatedShapeConsumer {
      shapeConsumer.initialShape(shape: .geometry(.point(Point(LocationCoordinate2D(latitude: 40.71427, longitude: -74.00597)))))
      let start = Date()
      let animation = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true, block: { timer in
        let diff = timer.fireDate.timeIntervalSince(start)
        
        shapeConsumer.updateShape(shape: .geometry(.point(Point(LocationCoordinate2D(latitude: 40.71427 + diff / 2000.0, longitude: -74.00597 + diff / 2000.0)))))
      })
      timerAnimations.append((shapeConsumer, animation))
      consumers.insert(shapeConsumer, at: atIndex)
      super.insertReactSubview(subview, at: atIndex)
    } else {
      Logger.log(level: .error, message: "ShapeAnimators only accepts AnimatedShapeConsumers aka ShapeSource as children but passed: \(subview)")
    }
  }
  
  @objc open override func removeReactSubview(_ subview: UIView!) {
    consumers.removeAll(where: { $0 === (subview as? AnimatedShapeConsumer) })
    super.removeReactSubview(subview)
  }
}
