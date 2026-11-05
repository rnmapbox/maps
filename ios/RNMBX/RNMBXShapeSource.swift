import MapboxMaps
import Turf

private let LOG_TAG = "RNMBXShapeSource"

/// Features parsed off the main thread, on the way to `RNMBXShapeSource`.
@objc(RNMBXParsedFeatures)
public class RNMBXParsedFeatures: NSObject {
  let features: [Feature]

  init(features: [Feature]) {
    self.features = features
  }

  @objc public static func parse(_ featuresJSON: String) throws -> RNMBXParsedFeatures {
    guard let data = featuresJSON.data(using: .utf8) else {
      throw RNMBXError.parseError("features are not utf8")
    }
    return RNMBXParsedFeatures(features: try JSONDecoder().decode(FeatureCollection.self, from: data).features)
  }
}

enum PartialChangeType {
  case add, update, remove
}

/// A call of addFeatures, updateFeatures or removeFeatures that the SDK has not ruled on yet.
final class PartialChange {
  let type: PartialChangeType
  let featureIds: [String]
  let features: [Feature]
  let shapeRevision: Int
  let sequence: Int
  let resolver: RCTPromiseResolveBlock
  let rejecter: RCTPromiseRejectBlock

  var dataId: String { String(sequence) }

  init(type: PartialChangeType, featureIds: [String], features: [Feature], shapeRevision: Int, sequence: Int,
       resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    self.type = type
    self.featureIds = featureIds
    self.features = features
    self.shapeRevision = shapeRevision
    self.sequence = sequence
    self.resolver = resolver
    self.rejecter = rejecter
  }

  func reject(_ message: String) {
    rejecter("partialUpdate", message, nil)
  }

  func firstFeatures(_ count: Int) -> PartialChange {
    PartialChange(type: type, featureIds: Array(featureIds.prefix(count)), features: Array(features.prefix(count)),
                  shapeRevision: shapeRevision, sequence: sequence, resolver: resolver, rejecter: rejecter)
  }
}

/// What a refused SDK call did: `applied` took effect, `refused` did not, and the rest was never looked at.
struct PartialRefusal {
  let applied: [PartialChange]
  let appliedPart: PartialChange?
  let refused: PartialChange
}

/// The calls waiting for a result, oldest first. See PendingPartialChanges.kt for how they are sent.
struct PendingPartialChanges {
  private(set) var changes: [PartialChange] = []
  private var inFlightCount = 0
  private var nextSequence = 1

  private var inFlight: ArraySlice<PartialChange> { changes.prefix(inFlightCount) }

  mutating func add(type: PartialChangeType, featureIds: [String], features: [Feature], shapeRevision: Int,
                    resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    changes.append(PartialChange(type: type, featureIds: featureIds, features: features, shapeRevision: shapeRevision,
                                 sequence: nextSequence, resolver: resolver, rejecter: rejecter))
    nextSequence += 1
  }

  /// The calls to send now as one, if none is in flight and the oldest was made on this revision of the shape.
  mutating func next(shapeRevision: Int) -> [PartialChange] {
    guard inFlightCount == 0, let first = changes.first, first.shapeRevision == shapeRevision else { return [] }
    var ids = Set<String>()
    var count = 0
    for change in changes {
      let mergeable = change.type == first.type && change.shapeRevision == shapeRevision &&
        (change.type == .update || ids.isDisjoint(with: change.featureIds)) &&
        (change.type != .remove || count == 0)
      if !mergeable { break }
      count += 1
      ids.formUnion(change.featureIds)
    }
    inFlightCount = count
    return Array(inFlight)
  }

  mutating func markNoneInFlight() {
    inFlightCount = 0
  }

  func isInFlight(dataId: String) -> Bool {
    inFlight.last?.dataId == dataId
  }

  /// The SDK leaves `dataId` empty when it refuses a call straight away.
  func isRefusalOfInFlight(dataId: String, featureId: String?) -> Bool {
    inFlightCount > 0 && (dataId.isEmpty || isInFlight(dataId: dataId)) &&
      (featureId == nil || inFlight.contains { $0.featureIds.contains(featureId!) })
  }

  mutating func confirm() -> [PartialChange] {
    let taken = Array(inFlight)
    changes.removeFirst(inFlightCount)
    inFlightCount = 0
    return taken
  }

  /// `featureId` is nil when the SDK refused the call as a whole.
  mutating func refuse(featureId: String?) -> PartialRefusal {
    let refusedIndex = inFlight.firstIndex { call in featureId.map(call.featureIds.contains) ?? false } ?? 0
    let refused = changes[refusedIndex]
    let appliedCount = featureId.flatMap(refused.featureIds.firstIndex(of:)) ?? 0
    let refusal = PartialRefusal(applied: Array(changes.prefix(refusedIndex)),
                                 appliedPart: appliedCount > 0 ? refused.firstFeatures(appliedCount) : nil,
                                 refused: refused)
    changes.removeFirst(refusedIndex + 1)
    inFlightCount = 0
    return refusal
  }

  mutating func replaced(by shapeRevision: Int) -> [PartialChange] {
    let count = changes.prefix { $0.shapeRevision < shapeRevision }.count
    let taken = Array(changes.prefix(count))
    changes.removeFirst(count)
    inFlightCount = max(inFlightCount - count, 0)
    return taken
  }

  mutating func clear() -> [PartialChange] {
    let taken = changes
    changes = []
    inFlightCount = 0
    return taken
  }
}

/// Net effect of the confirmed calls, to reapply on a style reload. See PartialFeatureChanges.kt.
struct PartialFeatureChanges {
  private var addedById: [String: (order: Int, feature: Feature)] = [:]
  private var updatedById: [String: (order: Int, feature: Feature)] = [:]
  private var removedIds: [String: Int] = [:]
  private var nextOrder = 0

  var added: [Feature] { addedById.values.sorted { $0.order < $1.order }.map { $0.feature } }
  var updated: [Feature] { updatedById.values.sorted { $0.order < $1.order }.map { $0.feature } }
  var removed: [String] { removedIds.sorted { $0.value < $1.value }.map { $0.key } }

  private mutating func order(of id: String, in features: [String: (order: Int, feature: Feature)]) -> Int {
    if let existing = features[id] {
      return existing.order
    }
    nextOrder += 1
    return nextOrder
  }

  mutating func record(_ change: PartialChange) {
    switch change.type {
    case .add:
      for (id, feature) in zip(change.featureIds, change.features) {
        if removedIds.removeValue(forKey: id) != nil {
          updatedById[id] = (order(of: id, in: updatedById), feature)
        } else {
          addedById[id] = (order(of: id, in: addedById), feature)
        }
      }
    case .update:
      for (id, feature) in zip(change.featureIds, change.features) {
        if addedById[id] != nil {
          addedById[id] = (order(of: id, in: addedById), feature)
        } else {
          updatedById[id] = (order(of: id, in: updatedById), feature)
        }
      }
    case .remove:
      for id in change.featureIds where addedById.removeValue(forKey: id) == nil {
        updatedById.removeValue(forKey: id)
        nextOrder += 1
        removedIds[id] = nextOrder
      }
    }
  }
}

@objc
public class RNMBXShapeSource : RNMBXSource {
  @objc public var url : String? {
    didSet {
      partialChanges = PartialFeatureChanges()
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
  var shapeString: String? = nil

  var partialChanges = PartialFeatureChanges()
  var pendingChanges = PendingPartialChanges()
  var appliedShapeRevision = 0
  var sourceAdded = false
  var partialChangeSubscriptions: [AnyCancelable] = []

  @objc public var shapeRevision: NSNumber? {
    didSet {
      applyShapeRevision()
    }
  }

  @objc public var shape : String? {
    didSet {
      shapeAnimator?.unsubscribe(consumer: self)
      shapeAnimator = nil
      partialChanges = PartialFeatureChanges()

      if let shape = shape, ShapeAnimatorManager.shared.isShapeAnimatorTag(shape: shape) {
        if let shapeAnimator = ShapeAnimatorManager.shared.get(shape: shape) {
          self.shapeAnimator = shapeAnimator
          shapeAnimator.subscribe(consumer: self)
          
          let shape = shapeAnimator.getShape()
          shapeUpdated(shape: shape)
        }
      } else {
        // Hand Mapbox the raw string so its GeoJSON parsing queue decodes it off the main thread.
        logged(LOG_TAG, "updateShape") {
          setShapeSourceData(shape)
        }
      }
    }
  }
  
  
  public override func addToMap(_ map: RNMBXMapView, mapView: MapView, style: Style) {
    super.addToMap(map, mapView:mapView, style: style)
    replayPartialChanges(style)
    sourceAdded = true
    sendPartialChanges()
  }
  
  public override func removeFromMap(_ map: RNMBXMapView, mapView: MapView, reason: RemovalReason) -> Bool {
    partialChangesRemovedFromMap(reason: reason)
    if (reason == .ViewRemoval) {
      shapeAnimator?.unsubscribe(consumer: self)
    }
    return super.removeFromMap(map, mapView:mapView, reason: reason)
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
  @objc public var clusterMinPoints : NSNumber?
  @objc public var clusterProperties : [String: [Any]]?;

  @objc public var maxZoomLevel : NSNumber?
  @objc public var minZoomLevel : NSNumber?
  @objc public var buffer : NSNumber?
  @objc public var tolerance : NSNumber?
  @objc public var lineMetrics : Bool = false

  override func sourceType() -> Source.Type {
    return GeoJSONSource.self
  }

  override func makeSource() -> Source
  {
    var result =  GeoJSONSource(id: id)

    result.data = shapeSourceData()

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

    if let clusterMinPoints = clusterMinPoints {
      result.clusterMinPoints = clusterMinPoints.doubleValue
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

    if let minZoomLevel = minZoomLevel {
      result.minzoom = minZoomLevel.doubleValue
    }

    if let buffer = buffer {
      result.buffer = buffer.doubleValue
    }

    if let tolerance = tolerance {
      result.tolerance = tolerance.doubleValue
    }

    result.lineMetrics = lineMetrics

    if let promoteId = promoteIdValue() {
      result.promoteId2 = promoteId
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
  func setShapeSourceData(_ shape: String?) {
    shapeObject = nil
    shapeString = shape
    applyShapeSourceData()
  }

  func setShapeSourceData(_ shape: GeoJSONObject) {
    shapeString = nil
    shapeObject = shape
    applyShapeSourceData()
  }

  private func applyShapeSourceData() {
    doUpdate { (style) in
      logged(LOG_TAG, "setShape") {
        style.updateGeoJSONSource(withId: id, data: shapeSourceData())
      }
    }
  }

  func shapeSourceData() -> GeoJSONSourceData {
    if let shapeObject = shapeObject {
      return toGeoJSONSourceData(shapeObject)
    }
    if let shapeString = shapeString {
      return .string(shapeString)
    }
    return emptyShape()
  }

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
    case .string(_):
      throw RNMBXError.parseError("url as shape is not supported when updating a ShapeSource")
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

  @objc public func getClusterChildren(
    featureJSON: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    getClusterChildren(featureJSON) { result in
      switch result {
      case .success(let features):
        logged("getClusterChildren", rejecter: rejecter) {
          let featuresJSON: Any = try features.features.toJSON()
          resolver([
            "data": ["type": "FeatureCollection", "features": featuresJSON]
          ])
        }
      case .failure(let error):
        rejecter(error.localizedDescription, "Error.getClusterChildren", error)
      }
    }
  }

  @objc public func getClusterLeaves(
    featureJSON: String,
    number: uint,
    offset: uint,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    getClusterLeaves(featureJSON, number: number, offset: offset) { result in
      switch result {
      case .success(let features):
        logged("getClusterLeaves", rejecter: rejecter) {
          let featuresJSON: Any = try features.features.toJSON()
          resolver([
            "data": ["type": "FeatureCollection", "features": featuresJSON]
          ])
        }
      case .failure(let error):
        rejecter(error.localizedDescription, "Error.getClusterLeaves", error)
      }
    }
  }

  @objc public func getClusterExpansionZoom(
    featureJSON: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    getClusterExpansionZoom(featureJSON) { result in
      switch result {
      case .success(let zoom):
        resolver([
          "data": NSNumber(value: zoom)
        ])
      case .failure(let error):
        rejecter(error.localizedDescription, "Error.getClusterExpansionZoom", error)
      }
    }
  }
}

// MARK: - addFeatures/updateFeatures/removeFeatures

private let SHAPE_REPLACED_ERROR = "ShapeSource: a new shape replaced this partial update"

extension RNMBXShapeSource
{
  @objc public func addFeatures(
    _ features: RNMBXParsedFeatures,
    featureIds: [String],
    shapeRevision: Int,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    enqueuePartialChange(.add, featureIds: featureIds, features: features.features, shapeRevision: shapeRevision, resolver: resolver, rejecter: rejecter)
  }

  @objc public func updateFeatures(
    _ features: RNMBXParsedFeatures,
    featureIds: [String],
    shapeRevision: Int,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    enqueuePartialChange(.update, featureIds: featureIds, features: features.features, shapeRevision: shapeRevision, resolver: resolver, rejecter: rejecter)
  }

  @objc public func removeFeatures(
    featureIds: [String],
    shapeRevision: Int,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    enqueuePartialChange(.remove, featureIds: featureIds, features: [], shapeRevision: shapeRevision, resolver: resolver, rejecter: rejecter)
  }

  private func enqueuePartialChange(
    _ type: PartialChangeType,
    featureIds: [String],
    features: [Feature],
    shapeRevision: Int,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    if shapeRevision < appliedShapeRevision {
      rejecter("partialUpdate", SHAPE_REPLACED_ERROR, nil)
      return
    }
    pendingChanges.add(type: type, featureIds: featureIds, features: features, shapeRevision: shapeRevision, resolver: resolver, rejecter: rejecter)
    sendPartialChanges()
  }

  func applyShapeRevision() {
    guard let revision = shapeRevision?.intValue, revision != appliedShapeRevision else { return }
    appliedShapeRevision = revision
    pendingChanges.replaced(by: revision).forEach { $0.reject(SHAPE_REPLACED_ERROR) }
    sendPartialChanges()
  }

  fileprivate func sendPartialChanges() {
    guard sourceAdded else { return }
    subscribeToPartialChangeResults()
    doUpdate { style in
      let changes = pendingChanges.next(shapeRevision: appliedShapeRevision)
      guard let dataId = changes.last?.dataId, let type = changes.first?.type else { return }
      let features = changes.flatMap { $0.features }
      switch type {
      case .add:
        style.addGeoJSONSourceFeatures(forSourceId: id, features: features, dataId: dataId)
      case .update:
        style.updateGeoJSONSourceFeatures(forSourceId: id, features: features, dataId: dataId)
      case .remove:
        style.removeGeoJSONSourceFeatures(forSourceId: id, featureIds: changes.flatMap { $0.featureIds }, dataId: dataId)
      }
    }
  }

  fileprivate func replayPartialChanges(_ style: Style) {
    let added = partialChanges.added
    if !added.isEmpty {
      style.addGeoJSONSourceFeatures(forSourceId: id, features: added)
    }
    let updated = partialChanges.updated
    if !updated.isEmpty {
      style.updateGeoJSONSourceFeatures(forSourceId: id, features: updated)
    }
    let removed = partialChanges.removed
    if !removed.isEmpty {
      style.removeGeoJSONSourceFeatures(forSourceId: id, featureIds: removed)
    }
  }

  private func subscribeToPartialChangeResults() {
    guard partialChangeSubscriptions.isEmpty, !pendingChanges.changes.isEmpty, let mapboxMap = map?.mapView?.mapboxMap else { return }
    partialChangeSubscriptions = [
      mapboxMap.onSourceDataLoaded.observe { [weak self] event in
        guard let self, event.sourceId == self.id, event.type == .metadata,
              let dataId = event.dataId, !dataId.isEmpty else { return }
        guard self.pendingChanges.isInFlight(dataId: dataId) else { return }
        for change in self.pendingChanges.confirm() {
          self.partialChanges.record(change)
          change.resolver(nil)
        }
        self.onPartialChangeSettled()
      },
      mapboxMap.onMapLoadingError.observe { [weak self] error in
        guard let self, error.sourceId == self.id, error.type == .source else { return }
        self.onPartialChangeRefused(error.message)
      }
    ]
  }

  private func onPartialChangeRefused(_ message: String) {
    guard let data = message.data(using: .utf8),
          let json = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any],
          let dataId = json["dataId"] as? String else { return }
    let refusedMessage = json["message"] as? String ?? message
    let featureId = refusedMessage.range(of: "feature id: ").map { String(refusedMessage[$0.upperBound...]) }
    guard pendingChanges.isRefusalOfInFlight(dataId: dataId, featureId: featureId) else { return }
    let refusal = pendingChanges.refuse(featureId: featureId)
    for change in refusal.applied {
      partialChanges.record(change)
      change.resolver(nil)
    }
    if let appliedPart = refusal.appliedPart {
      partialChanges.record(appliedPart)
    }
    refusal.refused.reject(refusedMessage)
    let appliedFeatures = refusal.applied.flatMap { $0.features } + (refusal.appliedPart?.features ?? [])
    if !appliedFeatures.isEmpty {
      // The SDK renders what a refused call kept only with the next change, so update them to themselves
      doUpdate { style in
        style.updateGeoJSONSourceFeatures(forSourceId: id, features: appliedFeatures)
      }
    }
    onPartialChangeSettled()
  }

  private func onPartialChangeSettled() {
    if pendingChanges.changes.isEmpty {
      partialChangeSubscriptions = []
    } else {
      sendPartialChanges()
    }
  }

  fileprivate func partialChangesRemovedFromMap(reason: RemovalReason) {
    sourceAdded = false
    if reason == .StyleChange {
      pendingChanges.markNoneInFlight()
    } else {
      pendingChanges.clear().forEach { $0.reject("ShapeSource was removed from the map") }
    }
    partialChangeSubscriptions = []
  }
}

// MARK: shape animation

extension RNMBXShapeSource: ShapeAnimationConsumer {
  func shapeUpdated(shape: Turf.GeoJSONObject) {
    setShapeSourceData(shape)
  }
}
