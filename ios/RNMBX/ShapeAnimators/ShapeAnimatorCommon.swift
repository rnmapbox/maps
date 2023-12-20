import MapboxMaps

protocol ShapeAnimationConsumer: AnyObject {
  func shapeUpdated(shape: GeoJSONObject)
}

protocol ShapeAnimator {
  func getShape() -> GeoJSONObject
  func getAnimatedShape() -> GeoJSONObject
  func subscribe(consumer: ShapeAnimationConsumer)
  func unsubscribe(consumer: ShapeAnimationConsumer)
  func start()
}

class WeakShapeAnimationConsumer {
  weak var consumer: ShapeAnimationConsumer?

  init(_ consumer: ShapeAnimationConsumer) {
    self.consumer = consumer
  }
}

public class ShapeAnimatorCommon: NSObject, ShapeAnimator {
  var tag: Int
  var timer: Timer? = nil
  
  private let fps: Double = 30
  
  init(tag: Int) {
    self.tag = tag
  }
  
  /// The number of seconds since the global shape animator timer began.
  public var currentTimestamp: Double {
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
      timer?.invalidate()
      timer = nil
    }
  }
  
  // - MARK: Lifecycle

  func start() {
    timer?.invalidate()
    
    DispatchQueue.main.async {
      let timer = Timer.scheduledTimer(
        withTimeInterval: 1 / self.fps,
        repeats: true,
        block: { timer in
          let shape = self.getAnimatedShape()
          self.subscribers.forEach {
            $0.consumer?.shapeUpdated(shape: shape)
          }
        }
      )
      self.timer = timer
    }
  }
  
  // - MARK: Subclasses should implement
  
  func getShape() -> GeoJSONObject {
    fatalError("getShape() must be overridden in all subclasses of ShapeAnimatorCommon")
  }
  
  func getAnimatedShape() -> GeoJSONObject {
    fatalError("getAnimatedShape() must be overridden in all subclasses of ShapeAnimatorCommon")
  }
}
