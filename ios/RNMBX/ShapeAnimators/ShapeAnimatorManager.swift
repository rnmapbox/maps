private let LOG_TAG = "ShapeAnimatorManager"

class ShapeAnimatorManager {
  static let shared = ShapeAnimatorManager();

  typealias Tag = Int

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
  
  func isShapeAnimatorTag(shape: String) -> Bool {
    return shape.starts(with: "{\"__nativeTag\":")
  }
  
  func get(tag: Tag) -> ShapeAnimator? {
    return animatorByTags[tag]
  }

  func get(shape: String) -> ShapeAnimator?  {
    if isShapeAnimatorTag(shape: shape) {
      let data = Data(shape.utf8)
      do {
        if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
          if let tag = json["__nativeTag"] as? Int {
            return get(tag: tag)
          }
        }
      } catch {
        Logger.log(level: .error, tag: LOG_TAG, message: "Unable to get animator tag from \(shape): \(error)")
      }
    }
    return nil
  }
}
