import MapboxMaps

 protocol ShapeAnimationConsumer: AnyObject {
   func shapeUpdated(shape: GeoJSONObject)
 }

protocol ShapeAnimator {
  func getShape() -> GeoJSONObject
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

public class ShapeAnimatorCommon : NSObject, ShapeAnimator {
  var tag: Int
  
  var timer: Timer? = nil
  var progress: TimeInterval = 0.0
  
  init(tag: Int) {
    self.tag = tag
  }

  // MARK: subscriptions
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

  func start() {
    if let timer = timer {
      timer.invalidate()
    }

    let start = Date()
    DispatchQueue.main.async {
      let timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true, block: { timer in
        let diff = timer.fireDate.timeIntervalSince(start)
        self.progress = diff

        let shape = self.getAnimatedShape(timeIntervalSinceStart: diff)
        self.subscribers.forEach { $0.consumer?.shapeUpdated(shape: shape) }
      })
      self.timer = timer
    }
  }

  /// - MARK: Subclasses should implement
   
  func getShape() -> GeoJSONObject {
    return getAnimatedShape(timeIntervalSinceStart: progress)
  }

  func getAnimatedShape(timeIntervalSinceStart: TimeInterval) -> GeoJSONObject {
    fatalError("Subclasses should implement")
  }
}
