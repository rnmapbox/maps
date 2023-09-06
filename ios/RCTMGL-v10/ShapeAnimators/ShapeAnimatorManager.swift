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

class ShapeAnimatorBase : ShapeAnimator {
  var timer: Timer? = nil
  var progress: TimeInterval = 0.0

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
    fatalError("Subclasses should implement")
  }
  
  func getAnimatedShape(timeIntervalSinceStart: TimeInterval) -> GeoJSONObject {
    fatalError("Subclasses should implement")
  }
}

class ShapeAnimatorManager {
  static let shared = ShapeAnimatorManager();
  
  typealias Tag = Int
  
  var lastTag = 42
  
  var animatorByTags: [Tag: ShapeAnimator] = [:]

  func getShapeAnimatorByTag(tag: Tag) -> ShapeAnimator? {
    return animatorByTags[tag]
  }
  
  func register(tag: Tag, animator: ShapeAnimator) {
    animatorByTags[tag] = animator
  }
  
  func withAnimator(tag: NSNumber, callback: (ShapeAnimator) -> Void) {
    if let animator = animatorByTags[tag.intValue] {
      callback(animator)
    }
  }
  
  func get(shape: String) -> ShapeAnimator?  {
    do {
      if shape.starts(with: "{\"__nativeTag\":") {
        let data = Data(shape.utf8)
        if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
          if let tag = json["__nativeTag"] as? Int {
            return animatorByTags[tag]
          }
        }
      }
    } catch {
      
    }
    return nil
  }
}
