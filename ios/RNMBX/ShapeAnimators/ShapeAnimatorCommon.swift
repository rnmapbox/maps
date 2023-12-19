import MapboxMaps

protocol ShapeAnimationConsumer: AnyObject {
  func shapeUpdated(shape: GeoJSONObject)
}

protocol ShapeAnimator {
  func getAnimatedShape(dt: TimeInterval) -> GeoJSONObject
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
    
    var prevSec: TimeInterval = 0
    DispatchQueue.main.async {
      let timer = Timer.scheduledTimer(
        withTimeInterval: 1 / self.fps,
        repeats: true,
        block: { timer in
          let currentSec = timer.fireDate.timeIntervalSince1970
          let dt = currentSec - prevSec
          let shape = self.getAnimatedShape(dt: dt)
          self.subscribers.forEach {
            $0.consumer?.shapeUpdated(shape: shape)
          }
          prevSec = currentSec
        }
      )
      self.timer = timer
    }
  }
  
  // - MARK: Subclasses should implement
  
  func getAnimatedShape(dt: TimeInterval) -> GeoJSONObject {
    fatalError("getAnimatedShape() must be overridden in all subclasses of ShapeAnimatorCommon")
  }
}
