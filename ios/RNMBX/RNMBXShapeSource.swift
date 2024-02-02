import MapboxMaps
import Turf

private let LOG_TAG = "RNMBXShapeSource"

@objc
public class RNMBXShapeSource : RNMBXSource {
  @objc public var url : String? {
    didSet {
      parseJSON(url) { [weak self] result in
        guard let self = self else { return }

        switch result {
          case .success(let obj):
            self.doUpdate { (style) in
              logged(LOG_TAG, "setUrl") {
                try style.updateGeoJSONSource(withId: self.id, geoJSON: obj)
              }
            }
          case .failure(let error):
            Logger.log(level: .error, message: "Update url failed", error: error)
        }
      }
    }
  }

  var shapeAnimator: ShapeAnimator? = nil
  var shapeObject: GeoJSONObject? = nil

  @objc public var shape : String? {
    didSet {
      shapeAnimator?.unsubscribe(consumer: self)
      shapeAnimator = nil
      
      if let shape = shape, ShapeAnimatorManager.shared.isShapeAnimatorTag(shape: shape) {
        if let shapeAnimator = ShapeAnimatorManager.shared.get(shape: shape) {
          self.shapeAnimator = shapeAnimator
          shapeAnimator.subscribe(consumer: self)
          
          let shape = shapeAnimator.getShape()
          shapeUpdated(shape: shape)
        }
      } else {        
        logged(LOG_TAG, "updateShape") {
          let obj : GeoJSONObject = try parse(shape)
          shapeObject = obj
          
          doUpdate { (style) in
            logged(LOG_TAG, "setShape") {
              try style.updateGeoJSONSource(withId: id, geoJSON: obj)
            }
          }
        }
      }
    }
  }
  
  public override func addToMap(_ map: RNMBXMapView, style: Style) {
    super.addToMap(map, style: style)
  }
  
  public override func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    if (reason == .ViewRemoval) {
      shapeAnimator?.unsubscribe(consumer: self)
    }
    return super.removeFromMap(map, reason: reason)
  }

  @objc public var cluster : NSNumber?
  @objc public var clusterRadius : NSNumber?
  @objc public var clusterMaxZoomLevel : NSNumber? {
    didSet {
      logged(LOG_TAG, "clusterMaxZoomLevel") {
        if let number = clusterMaxZoomLevel?.doubleValue {
          doUpdate { (style) in
            logged(LOG_TAG, "clusterMaxZoomLevel") {
              try style.setSourceProperty(for: id, property: "clusterMaxZoom", value: number)
            }
          }
        }
      }
    }
  }
  @objc public var clusterProperties : [String: [Any]]?;

  @objc public var maxZoomLevel : NSNumber?
  @objc public var buffer : NSNumber?
  @objc public var tolerance : NSNumber?
  @objc public var lineMetrics : NSNumber?

  override func sourceType() -> Source.Type {
    return GeoJSONSource.self
  }

  override func makeSource() -> Source
  {
    #if RNMBX_11
    var result =  GeoJSONSource(id: id)
    #else
    var result =  GeoJSONSource()
    #endif

    if let shapeObject = shapeObject {
      result.data = toGeoJSONSourceData(shapeObject)
    } else {
      result.data = emptyShape()
    }

    if let url = url {
      result.data = .url(URL(string: url)!)
    }

    if let cluster = cluster {
      result.cluster = cluster.boolValue
    }

    if let clusterRadius = clusterRadius {
      result.clusterRadius = clusterRadius.doubleValue
    }

    if let clusterMaxZoomLevel = clusterMaxZoomLevel {
      result.clusterMaxZoom = clusterMaxZoomLevel.doubleValue
    }

    do {
      if let clusterProperties = clusterProperties {
        result.clusterProperties = try clusterProperties.mapValues { (params : [Any]) in
          let data = try JSONSerialization.data(withJSONObject: params, options: .prettyPrinted)
          let decodedExpression = try JSONDecoder().decode(Expression.self, from: data)

          return decodedExpression
        }
      }
    } catch {
      Logger.log(level: .error, tag: LOG_TAG, message: "makeSource: parsing clusterProperties failed", error: error)
    }

    if let maxZoomLevel = maxZoomLevel {
      result.maxzoom = maxZoomLevel.doubleValue
    }

    if let buffer = buffer {
      result.buffer = buffer.doubleValue
    }

    if let tolerance = tolerance {
      result.tolerance = tolerance.doubleValue
    }

    if let lineMetrics = lineMetrics {
      result.lineMetrics = lineMetrics.boolValue
    }

    return result
  }

  func doUpdate(_ update:(Style) -> Void) {
    guard let map = self.map,
          let _ = self.source,
          map.mapboxMap.style.sourceExists(withId: id) else {
      return
    }

    let style = map.mapboxMap.style
    update(style)
  }

  func updateSource(property: String, value: Any) {
    doUpdate { style in
      try! style.setSourceProperty(for: id, property: property, value: value)
    }
  }
  
  deinit {
    shapeAnimator?.unsubscribe(consumer: self)
  }
}

// MARK: - parseJSON(url)

extension RNMBXShapeSource
{
  func toGeoJSONSourceData(_ shape: GeoJSONObject) -> GeoJSONSourceData {
    switch shape {
    case .geometry(let geometry):
      return .geometry(geometry)
    case .feature(let feature):
      return .feature(feature)
    case .featureCollection(let features):
      return .featureCollection(features)
    }
  }

  func parseJSON(_ url: String?, completion: @escaping (Result<GeoJSONObject, Error>) -> Void) {
    guard let url = url else { return }

    DispatchQueue.global().async { [url] in
      let result: Result<GeoJSONObject, Error>

      do {
        let data = try Data(contentsOf: URL(string: url)!)
        let obj = try JSONDecoder().decode(GeoJSONObject.self, from: data)

        result = .success(obj)
      } catch {
        result = .failure(error)
      }

      DispatchQueue.main.async {
        completion(result)
      }
    }
  }
}

// MARK: - parse(shape)

extension RNMBXShapeSource
{
  func parse(_ shape: String) throws -> GeoJSONSourceData {
    guard let data = shape.data(using: .utf8) else {
      throw RNMBXError.parseError("shape is not utf8")
    }
    do {
      return try JSONDecoder().decode(GeoJSONSourceData.self, from: data)
    } catch {
      let origError = error
      do {
        // workaround for mapbox issue, GeoJSONSourceData can't decode a single geometry
        let geometry = try JSONDecoder().decode(Geometry.self, from: data)
        return .geometry(geometry)
      } catch {
        throw origError
      }
    }
  }

  func parse(_ shape: String) throws -> Feature {
    guard let data = shape.data(using: .utf8) else {
      throw RNMBXError.parseError("shape is not utf8")
    }
    return try JSONDecoder().decode(Feature.self, from: data)
  }

  func parse(_ shape: String?) throws -> GeoJSONObject {
    guard let shape = shape else {
      return emptyGeoJSONObject()
    }
    let data : GeoJSONSourceData = try parse(shape)
    switch data {
    case .empty:
      return emptyGeoJSONObject()
    case .feature(let feature):
      return .feature(feature)
    case .featureCollection(let featureCollection):
      return .featureCollection(featureCollection)
    case .geometry(let geometry):
      return .geometry(geometry)
    #if RNMBX_11
    case .string(_):
      // RNMBX_11_TODO
      throw RNMBXError.parseError("url as shape is not supported when updating a ShapeSource")
    #else
    case .url(_):
      throw RNMBXError.parseError("url as shape is not supported when updating a ShapeSource")
      #endif
    }
  }

  func emptyGeoJSONObject() -> GeoJSONObject {
    return .featureCollection(emptyFeatureCollection())
  }

  func emptyShape() -> GeoJSONSourceData {
    return GeoJSONSourceData.featureCollection(FeatureCollection(features:[]))
  }

  func emptyFeatureCollection() -> FeatureCollection {
    return FeatureCollection(features:[])
  }

  func parseAsJSONObject(shape: String?) -> Any? {
    guard let shape = shape else {
      return nil
    }
    guard let data = shape.data(using: .utf8) else {
      Logger.log(level: .error, tag: LOG_TAG, message: "parseAsJSONObject: Shape is not utf8")
      return nil
    }
    let objs = logged(LOG_TAG, "parseAsJSONObject") {
      try JSONSerialization.jsonObject(with: data)
    }
    return objs
  }
}

#if !RNMBX_11
class DummyCancellable : Cancelable {
  func cancel() {}
}

#if false
extension MapboxMap {
  @discardableResult
  public func getGeoJsonClusterExpansionZoom(forSourceId sourceId: String,
                                             feature: Feature,
                                             completion: @escaping (Result<FeatureExtensionValue, Error>) -> Void) -> Cancelable {
    self.queryFeatureExtension(for: sourceId,
                               feature: feature,
                               extension: "supercluster",
                               extensionField: "expansion-zoom",
                               args: nil,
                               completion: completion)
    return DummyCancellable()
  }
  @discardableResult
  public func getGeoJsonClusterChildren(forSourceId sourceId: String,
                                        feature: Feature,
                                        completion: @escaping (Result<FeatureExtensionValue, Error>) -> Void) -> Cancelable {
    self.queryFeatureExtension(for: sourceId,
                                   feature: feature,
                                   extension: "supercluster",
                                   extensionField: "children",
                                   args: nil,
                                   completion: completion)
    return DummyCancellable()
  }

  @discardableResult
  public func getGeoJsonClusterLeaves(forSourceId sourceId: String,
                                      feature: Feature,
                                      limit: UInt64 = 10,
                                      offset: UInt64 = 0,
                                      completion: @escaping (Result<FeatureExtensionValue, Error>) -> Void) -> Cancelable {
      self.queryFeatureExtension(for: sourceId,
                                   feature: /*MapboxCommon.Feature(*/feature/*)*/,
                                   extension: "supercluster",
                                   extensionField: "leaves",
                                   args: ["limit": limit, "offset": offset],
                                   completion: completion)
    return DummyCancellable()
  }
}
#endif
#endif

// MARK: - getClusterExpansionZoom/getClusterLeaves

extension RNMBXShapeSource
{
  func getClusterExpansionZoom(
    _ featureJSON: String,
    completion: @escaping (Result<Int, Error>) -> Void)
  {
    guard let mapView = map?.mapView else {
      completion(.failure(RNMBXError.failed("getClusterExpansionZoom: no mapView")))
      return
    }

    logged(LOG_TAG, "getClusterExpansionZoom", rejecter: { (_,_,error) in
      completion(.failure(error!))
    }) {
      let cluster : Feature = try parse(featureJSON);

      mapView.mapboxMap.getGeoJsonClusterExpansionZoom(forSourceId: self.id, feature: cluster) { result in
        switch result {
        case .success(let features):
          guard let value = features.value as? NSNumber else {
            completion(.failure(RNMBXError.failed("getClusterExpansionZoom: not a number")))
            return
          }

          completion(.success(value.intValue))
        case .failure(let error):
          completion(.failure(error))
        }
      }
    }
  }

  func getClusterLeaves(_ featureJSON: String,
                              number: uint,
                              offset: uint,
                              completion: @escaping (Result<FeatureExtensionValue, Error>) -> Void)
  {
    guard let mapView = map?.mapView else {
      completion(.failure(RNMBXError.failed("getClusterLeaves: no mapView")))
      return
    }

    logged(LOG_TAG, "getClusterLeaves", rejecter: { (_,_,error) in
      completion(.failure(error!))
    }) {
      let cluster : Feature = try parse(featureJSON);
      mapView.mapboxMap.getGeoJsonClusterLeaves(forSourceId: self.id, feature: cluster, limit: UInt64(number), offset: UInt64(offset)) {
        result in
        switch result {
        case .success(let features):
          completion(.success(features))
        case .failure(let error):
          completion(.failure(error))
        }
      }
    }
  }

  func getClusterChildren(_ featureJSON: String, completion: @escaping (Result<FeatureExtensionValue, Error>) -> Void) {
    guard let mapView = map?.mapView else {
      completion(.failure(RNMBXError.failed("getClusterChildren: no mapView")))
      return
    }

    logged(LOG_TAG, "getClusterChildren", rejecter: { (_,_,error) in
      completion(.failure(error!))
    }) {
      let cluster : Feature = try parse(featureJSON);
      mapView.mapboxMap.getGeoJsonClusterChildren(forSourceId: self.id, feature: cluster) {
        result in
        switch result {
        case .success(let features):
          completion(.success(features))
        case .failure(let error):
          completion(.failure(error))
        }
      }
    }
  }
}

// MARK: shape animation

extension RNMBXShapeSource: ShapeAnimationConsumer {
  func shapeUpdated(shape: Turf.GeoJSONObject) {
    shapeObject = shape
    doUpdate { (style) in
      logged("RCTMGLShapeSource.setShape") {
        try style.updateGeoJSONSource(withId: id, geoJSON: shape)
      }
    }
  }
}
