import MapboxMaps
/**
  ImageManager helps to resolve images defined by any of RNMBXImages component.
 */
class ImageManager {
  typealias Resolver = (String, UIImage) -> Void
  var subscriptions: [String: [Subscription]] = [:]
  var resolvedImages: [String: UIImage] = [:]
  
  class Subscription : Cancelable {
    var name: String
    var resolved: Resolver
    weak var manager: ImageManager?
    
    init(name: String, resolved: @escaping Resolver) {
      self.name = name
      self.resolved = resolved
    }
    
    func cancel() {
      manager?.unsubscript(subscription: self)
    }
  }
  
  func subscribe(name: String, resolved: @escaping Resolver) -> Subscription {
    var subscription = Subscription(name: name, resolved: resolved)
    var list = subscriptions[name] ?? []
    list.append(subscription)
    subscriptions[name] = list
    return subscription
  }
  
  func unsubscript(subscription: Subscription) {
    var list = subscriptions[subscription.name] ?? []
    list.removeAll { $0 === subscription }
    subscriptions[subscription.name] = list
  }

  func image(name: String) -> UIImage? {
    return resolvedImages[name]
  }

  func resolve(name: String, image: UIImage) {
    resolvedImages[name] = image
    subscriptions[name]?.forEach { $0.resolved(name, image) }
  }

  func remove(name: String) {
    resolvedImages.removeValue(forKey: name)
  }
}
