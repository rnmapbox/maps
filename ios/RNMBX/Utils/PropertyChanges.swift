
/**
 * This mechanism allows to separate property updates from application of property updates. Usefull for delaying the propery updates
 * because the object is not yet created for example. Or to apply multiple propery changes at once, as properties are not atomic.
 *
 * @sample
 *
 * class MapView {
 *   enum Property: String {
 *     case logo
 *     case compass
 *
 *     fun apply(mapView: MapView) {
 *       switch self {
 *         case .logo: mapView.applyLogo()
 *        case .compass: mapView.applyCompass() 
 *     }
 *   }
 *   val changes = PropertyChanges()
 *
 *   var logoPosition: LogoPosition;
 *
 *   func changed(_ property: Property) {
 *     changes.add(name: property.rawValue, update: property.apply)
 *   }
 *
 *   func changed(name: String, apply: @escaping (MapView) -> Void) {
 *     changes.add(name: name, apply: apply)
 * . }
 *
 * @objc override public func didSetProps(_ props: [String]) {
 *    changes.apply(self)
 *  }
 * }
 */

 class PropertyChanges<T> {
  var changes: [String: (T)->Void] = [:]
  var uniqKey: Int = 0
  
  func add(name: String, update: @escaping (T) -> Void) {
    changes[name] = update
  }
   
  func add(update: @escaping (T) -> Void) {
    let name = "#\(uniqKey)"
    uniqKey += 1
    changes[name] = update
  }
  
  func apply(_ target: T) {
    changes.forEach { name, updater in
      updater(target)
    }
    changes.removeAll()
  }
}
