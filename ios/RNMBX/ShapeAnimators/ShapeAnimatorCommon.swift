import MapboxMaps

protocol ShapeAnimationConsumer: AnyObject {
  func shapeUpdated(shape: GeoJSONObject)
}

protocol ShapeAnimator {
  func getShape() -> GeoJSONObject
  func getAnimatedShape(animatorAgeSec: TimeInterval) -> GeoJSONObject
  func subscribe(consumer: ShapeAnimationConsumer)
  func unsubscribe(consumer: ShapeAnimationConsumer)
  func refresh()
  func start()
  func stop()
}

class WeakShapeAnimationConsumer {
  weak var consumer: ShapeAnimationConsumer?

  init(_ consumer: ShapeAnimationConsumer) {
    self.consumer = consumer
  }
}

public class ShapeAnimatorCommon: NSObject, ShapeAnimator {
  public let tag: Int
  public let emptyGeoJsonObj: GeoJSONObject = .geometry(.lineString(.init([])))
  
  private var displayLink: CADisplayLink?
  private var startedAt: Double?
  
  init(tag: Int) {
    self.tag = tag
  }
  
  /** The number of seconds the animator has been running continuously. */
  public func getAnimatorAgeSec() -> TimeInterval {
    (displayLink?.targetTimestamp.magnitude ?? 0) - (startedAt ?? 0)
  }
  
  // MARK: Subscriptions
  
  var subscribers: [WeakShapeAnimationConsumer] = []
  
  func subscribe(consumer: ShapeAnimationConsumer) {
    subscribers.append(WeakShapeAnimationConsumer(consumer))
  }
  
  func unsubscribe(consumer: ShapeAnimationConsumer) {
    subscribers.removeAll { $0.consumer === consumer }
    subscribers.removeAll { $0.consumer === nil }
    if subscribers.isEmpty {
      stop()
    }
  }
  
  // - MARK: Lifecycle
  
  @objc func refresh() {
    if startedAt == nil {
      startedAt = displayLink?.targetTimestamp.magnitude ?? 0
    }
    
    let timestamp = getAnimatorAgeSec()
    print("Refreshing animator for tag \(tag): \(timestamp)")
    
    let shape = getAnimatedShape(animatorAgeSec: timestamp)
    
    subscribers.forEach { subscriber in
      subscriber.consumer?.shapeUpdated(shape: shape)
    }
  }
  
  func start() {
    if displayLink != nil {
      print("Timer for animator \(tag) is already running")
      return
    }

    print("Started timer for animator \(tag)")
    
    startedAt = nil
        
    displayLink = CADisplayLink(target: self, selector: #selector(refresh))
    displayLink!.add(to: .main, forMode: .default)
  }

  func stop() {
    print("Stopped timer for animator \(tag)")
    
    displayLink?.remove(from: .main, forMode: .default)
    displayLink = nil
  }
  
  // - MARK: Data providers
  
  func getShape() -> GeoJSONObject {
    return getAnimatedShape(animatorAgeSec: getAnimatorAgeSec())
  }
  
  func getAnimatedShape(animatorAgeSec: TimeInterval) -> GeoJSONObject {
    fatalError("getAnimatedShape() must be overridden in all subclasses of ShapeAnimatorCommon")
  }
}
