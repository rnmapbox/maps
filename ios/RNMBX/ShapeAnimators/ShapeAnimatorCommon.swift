import MapboxMaps

protocol ShapeAnimationConsumer: AnyObject {
  func shapeUpdated(shape: GeoJSONObject)
}

protocol ShapeAnimator {
  func getShape() -> GeoJSONObject
  func getAnimatedShape(currentTimestamp: TimeInterval) -> GeoJSONObject
  func subscribe(consumer: ShapeAnimationConsumer)
  func unsubscribe(consumer: ShapeAnimationConsumer)
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
  
  private var timer: Timer?
  private var startedAt = Date()
  
  private let fps: Double = 30
  private let period: Double
  
  init(tag: Int) {
    self.tag = tag
    period = 1 / fps
  }
  
  /** The animator's lifespan in seconds. */
  public func getCurrentTimestamp() -> TimeInterval {
    timer?.fireDate.timeIntervalSinceReferenceDate ?? 0
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
  
  func start() {
    if (timer != nil) {
      print("Timer for animator \(tag) is already running")
      return
    }
    
    print("Started timer for animator \(tag)")
    
    startedAt = Date()
    
    DispatchQueue.main.async {
      self.timer = Timer.scheduledTimer(
        withTimeInterval: self.period,
        repeats: true
      ) { timer in
        let timestamp = self.getCurrentTimestamp()
        let shape = self.getAnimatedShape(currentTimestamp: timestamp)
        self.subscribers.forEach { subscriber in
          subscriber.consumer?.shapeUpdated(shape: shape)
        }
      }
    }
  }
  
  func stop() {
    print("Stopped timer for animator \(tag)")
    
    DispatchQueue.main.async {
      self.timer?.invalidate()
      self.timer = nil
    }
  }
  
  // - MARK: Data providers
  
  func getShape() -> GeoJSONObject {
    return getAnimatedShape(currentTimestamp: getCurrentTimestamp())
  }
  
  func getAnimatedShape(currentTimestamp: TimeInterval) -> GeoJSONObject {
    fatalError("getAnimatedShape() must be overridden in all subclasses of ShapeAnimatorCommon")
  }
}
