import Foundation
import MapboxMaps

extension Date {
  func toJSONString() -> String {
    let dateFormatter = DateFormatter()
    let enUSPosixLocale = Locale(identifier: "en_US_POSIX")
    dateFormatter.locale = enUSPosixLocale
    dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZZZZZ"
    return dateFormatter.string(from: self as Date)
  }
}



@objc(RNMBXOfflineModule)
class RNMBXOfflineModule: RCTEventEmitter {
  var hasListeners = false
  
  static let RNMapboxInfoMetadataKey = "_rnmapbox"

  enum Callbacks : String {
    case error = "MapboOfflineRegionError"
    case progress = "MapboxOfflineRegionProgress"
  }
  
  enum State : String {
    case invalid
    case inactive
    case active
    case complete
    case unknown
  }
  
  lazy var offlineManager : OfflineManager = {
    #if RNMBX_11
    return OfflineManager()
    #else
    return OfflineManager(resourceOptions: .init(accessToken: RNMBXModule.accessToken!))
    #endif
  }()
  
  lazy var offlineRegionManager: OfflineRegionManager = {
    #if RNMBX_11
    return OfflineRegionManager()
    #else
    return OfflineRegionManager(resourceOptions: .init(accessToken: RNMBXModule.accessToken!))
    #endif
  }()

  lazy var tileStore : TileStore = {
    return TileStore.default
  }()
  
  struct TileRegionPack {
    init(name: String, state: State = .unknown, progress: TileRegionLoadProgress? = nil, metadata: [String:Any]) {
      self.name = name
      self.progress = progress
      self.metadata = metadata
      self.state = state

      if let rnMetadata = metadata[RNMapboxInfoMetadataKey] as? [String:Any] {
        if let styleURI = rnMetadata["styleURI"] as? String {
          self.styleURI = StyleURI(rawValue: styleURI)
        }
        if let bounds = rnMetadata["bounds"] as? [String:Any] {
          self.bounds = logged("RNMBXOfflineModule.TileRegionPack: cannot decode bounds") {
            let jsonData = try JSONSerialization.data(withJSONObject: bounds)
            return try JSONDecoder().decode(Geometry.self, from: jsonData)
          }
        }
        if let zoomRange = rnMetadata["zoomRange"] as? Any {
          self.zoomRange = logged("RNMBXOfflineModule.TileRegionPack: cannot decode zoomRange") {
            let jsonData = try JSONSerialization.data(withJSONObject: zoomRange)
            return try JSONDecoder().decode(ClosedRange<UInt8>.self, from: jsonData)
          }
        }
      }
    }
    
    init(name: String,
         state: State = .unknown,
         styleURI: StyleURI,
         bounds: Geometry,
         zoomRange: ClosedRange<UInt8>,
         metadata: [String:Any]) {
      self.name = name
      self.progress = nil
      self.cancelable = nil
      self.state = state
      
      self.styleURI = styleURI
      self.bounds = bounds
      self.zoomRange = zoomRange
      
      var metadata = metadata
      metadata[RNMapboxInfoMetadataKey] = [
        "styleURI": styleURI.rawValue,
        "bounds": logged("RNMBXOfflineModule.TileRegionPack: cannot encode bounds") { try JSONSerialization.jsonObject(with: try! JSONEncoder().encode(bounds)) },
        "zoomRange": logged("RNMBXOfflineModule.TileRegionPack: cannot encode zoomRange") { try JSONSerialization.jsonObject(with: try! JSONEncoder().encode(zoomRange))}
      ]
      self.metadata = metadata
    }

    var name: String
    var cancelable: Cancelable? = nil
    var progress : TileRegionLoadProgress? = nil
    var state : State = .inactive
    var metadata : [String:Any]

    // Stored in metadata for resume functionality:
    var bounds: Geometry? = nil
    var zoomRange: ClosedRange<UInt8>? = nil
    var styleURI: StyleURI? = nil
  }
  
  lazy var tileRegionPacks : [String: TileRegionPack] = [:]
  
  var progressEventThrottle : (
    waitBetweenEvents: Double?,
    lastSentTimestamp: Double?,
    lastSentState: State?
  ) = (
    300,
    nil,
    nil
  )
  
  @objc override
  public func startObserving() {
    super.startObserving()
    hasListeners = true
  }
  
  @objc override
  public func stopObserving() {
    super.stopObserving()
    hasListeners = false
  }
  
  @objc
  override
  static public func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc
  override
  public func constantsToExport() -> [AnyHashable: Any]! {
    return [:]
  }

  @objc
  override
  public func supportedEvents() -> [String] {
    return [Callbacks.error.rawValue, Callbacks.progress.rawValue]
  }
  
  // MARK: react methods
  
  @objc
  func createPack(_ options: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      do {
        let metadataStr = options["metadata"] as! String
        var metadata = try JSONSerialization.jsonObject(with: metadataStr.data(using: .utf8)!, options: []) as! [String:Any]
        metadata["styleURI"] = options["styleURL"]
        let id = metadata["name"] as! String
        
        let boundsStr = options["bounds"] as! String
        let boundsData = boundsStr.data(using: .utf8)
        var boundsFC = try JSONDecoder().decode(FeatureCollection.self, from: boundsData!)
        
        var bounds = self.convertPointPairToBounds(RNMBXFeatureUtils.fcToGeomtry(boundsFC))
        
        let actPack = RNMBXOfflineModule.TileRegionPack(
          name: id,
          styleURI: StyleURI(rawValue: options["styleURL"] as! String)!,
          bounds: bounds,
          zoomRange: (options["minZoom"] as! NSNumber).uint8Value...(options["maxZoom"] as! NSNumber).uint8Value,
          metadata: metadata
        )
        self.tileRegionPacks[id] = actPack
        self.startLoading(pack: actPack)
        
        resolver([
          "bounds": boundsStr,
          "metadata": String(data:try! JSONSerialization.data(withJSONObject: metadata, options: [.prettyPrinted]), encoding: .utf8)
        ])
      } catch {
        rejecter("createPack", error.localizedDescription, error)
      }
    }
  }
  
  @objc
  func getPackStatus(_ name: String,
                     resolver: @escaping RCTPromiseResolveBlock,
                     rejecter: @escaping RCTPromiseRejectBlock) {
    guard tileRegionPacks[name] != nil else {
      rejecter("RNMBXOfflineModule.getPackStatus", "pack \(name) not found", nil)
      return
    }
    
    tileStore.tileRegion(forId: name) { result in
      switch result {
      case .success(let region):
        self.tileStore.tileRegionMetadata(forId: name) { result in
          switch result {
          case .success(let metadata):
            let pack = TileRegionPack(
              name: name,
              progress: self.toProgress(region: region),
              metadata: logged("RNMBXOfflineModule.getPackStatus") { metadata as? [String:Any] } ?? [:]
            )
            self.tileRegionPacks[name] = pack
            resolver(self._makeRegionStatusPayload(pack: pack))
          case .failure(let error):
            Logger.log(level:.error, message: "Unable to fetch metadata for \(name)")
            rejecter("RNMBXOfflineModule.getPackStatus", error.localizedDescription, error)
          }
        }
      case .failure(let error):
        Logger.log(level:.error, message: "Unable to fetch region for \(name)")
        rejecter("RNMBXOfflineModule.getPackStatus", error.localizedDescription, error)
      }
    }
  }
  
  @objc
  func resumePackDownload(_ name: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock)
  {
    if let pack = tileRegionPacks[name] {
      startLoading(pack: pack)
      resolver(nil)
    } else {
      rejecter("resumePackDownload", "Unknown offline pack: \(name)", nil)
    }
  }
  
  @objc
  func pausePackDownload(_ name: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock)
  {
    if let pack = tileRegionPacks[name] {
      if let cancelable = pack.cancelable {
        cancelable.cancel()
        tileRegionPacks[name]?.cancelable = nil
        resolver(nil)
      } else {
        rejecter("pausePackDownload", "Offline pack: \(name) already cancelled", nil)
      }
    } else {
      rejecter("pausePackDownload", "Unknown offline region: \(name)", nil)
    }
  }
  
  @objc
  func setTileCountLimit(_ limit: NSNumber) {
    self.offlineRegionManager.setOfflineMapboxTileCountLimitForLimit(limit.uint64Value)
  }
  
  
  @objc
  func deletePack(_ name: String,
                  resolver: RCTPromiseResolveBlock,
                  rejecter: RCTPromiseRejectBlock)
  {
    guard let pack = tileRegionPacks[name] else {
      return resolver(nil)
    }
    
    guard pack.state != .invalid else {
      return rejecter("deletePack", "Pack: \(name) has already been deleted", nil)
    }
    
    tileStore.removeTileRegion(forId: name)
    tileRegionPacks[name]!.state = .invalid
    resolver(nil)
  }
  
  @objc
  func migrateOfflineCache(_ resolve : @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    // Old and new cache file paths
    let srcURL = URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("/Library/Application Support/com.mapbox.examples/.mapbox/cache.db")
    
    let destURL = URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("/Library/Application Support/.mapbox/map_data/map_data.db")
    
    let fileManager = FileManager.default
    
    do {
      try fileManager.createDirectory(at: destURL.deletingLastPathComponent(), withIntermediateDirectories: true, attributes: nil)
      try fileManager.moveItem(at: srcURL, to: destURL)
      resolve(nil)
    } catch {
      reject("migrateOfflineCache", error.localizedDescription, error)
    }
  }

  @objc
  func resetDatabase(_ resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    self.tileStore.allTileRegions { result in
      switch result {
      case .success(let regions):
        regions.forEach { region in
          self.tileStore.removeTileRegion(forId: region.id)
        }
        self.offlineManager.allStylePacks { result in
          switch result {
          case .success(let packs):
            packs.forEach { pack in
              if let url = logged("RNMBXOfflineModule.resetDatabase invalid styleURI",fn: { return URL(string: pack.styleURI) }),
                 let styleUri = logged("RNMBXOfflineModule.resetDatabase invalid styleURI2", fn: { return StyleURI(url: url) }) {
                self.offlineManager.removeStylePack(for: styleUri)
              }
            }
            resolve(nil)
          case .failure(let error):
            Logger.log(level:.error, message: "RNMBXOfflineModule.resetDatabase/allStylePacks \(error.localizedDescription) \(error)")
            rejecter("RNMBXOfflineModule.resetDatabase/allStylePacks", error.localizedDescription, error)
          }
        }
      case .failure(let error):
        Logger.log(level:.error, message: "RNMBXOfflineModule.resetDatabase/allTileRegions \(error.localizedDescription) \(error)")
        rejecter("RNMBXOfflineModule.resetDatabase/allTileRegions", error.localizedDescription, error)
      }
    }
  }
  
  @objc
  func getPacks(_ resolve : @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      self.tileStore.allTileRegions { result in
        switch result {
        case .success(let regions):
          self.convertRegionsToJSON(regions: regions, resolve: resolve, rejecter: rejecter)
        case .failure(let error):
          rejecter("TileStoreError", error.localizedDescription, error)
        }
      }
    }
  }
  
  func startLoading(pack: TileRegionPack) {
    let id = pack.name
    let metadata = pack.metadata
    guard let bounds = pack.bounds else {
      RNMBXLogError("RNMBXOfflineModule.startLoading failed as there are no bounds in pack")
      return
    }
    guard let zoomRange = pack.zoomRange else {
      RNMBXLogError("RNMBXOfflineModule.startLoading failed as there is no zoom range in pack")
      return
    }
    guard let styleURI = pack.styleURI else {
      RNMBXLogError("RNMBXOfflineModule.startLoading failed as there is no styleURI in pack")
      return
    }
    
    let stylePackLoadOptions = StylePackLoadOptions(glyphsRasterizationMode: .ideographsRasterizedLocally, metadata: pack.metadata)
    
    #if RNMBX_11
    let descriptorOptions = TilesetDescriptorOptions(
      styleURI: styleURI,
      zoomRange: zoomRange,
      tilesets: [], // RNMBX_11_TODO
      stylePackOptions: stylePackLoadOptions
    )
    #else
    let descriptorOptions = TilesetDescriptorOptions(
      styleURI: styleURI,
      zoomRange: zoomRange,
      stylePackOptions: stylePackLoadOptions
    )
    #endif
    let tilesetDescriptor = self.offlineManager.createTilesetDescriptor(for: descriptorOptions)
    
    let loadOptions = TileRegionLoadOptions(
      geometry: bounds, // RNMBXFeatureUtils.geometryToGeometry(bounds),
      descriptors: [tilesetDescriptor],
      metadata: metadata,
      acceptExpired: true,
      networkRestriction: .none,
      averageBytesPerSecond: nil)
    
    var lastProgress : TileRegionLoadProgress? = nil
    let task = self.tileStore.loadTileRegion(forId: id, loadOptions: loadOptions!, progress: {
      progress in
      lastProgress = progress
      self.tileRegionPacks[id]!.progress = progress
      self.tileRegionPacks[id]!.state = .active
      self.offlinePackProgressDidChange(progress: progress, metadata: metadata, state: .active)
    }) { result in
      switch result {
      case .success(let _):
        DispatchQueue.main.async {
          if let progess = lastProgress {
            self.offlinePackProgressDidChange(progress: progess, metadata: metadata, state: .complete)
          } else {
            Logger.log(level: .warn,
                       message: "RNMBXOfflineModule: startLoading: tile region completed, but got no progress information")
          }
          self.tileRegionPacks[id]!.state = .complete
        }
      case .failure(let error):
        DispatchQueue.main.async {
          self.tileRegionPacks[id]!.state = .inactive
          self.offlinePackDidReceiveError(name: id, error: error)
        }
      }
    }
    self.tileRegionPacks[id]!.cancelable = task
  }
  
  func convertRegionsToJSON(regions: [TileRegion], resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let taskGroup = DispatchGroup()
    
    var geomteryResults : [String: (Result<Geometry,Error>,TileRegion)] = [:]
    var metadataResults : [String: Result<Any,Error>] = [:]
    
    for region in regions {
      taskGroup.enter()
      taskGroup.enter()
      tileStore.tileRegionGeometry(forId: region.id) { (result) in
        geomteryResults[region.id] = (result, region)
        taskGroup.leave()
      }
      
      tileStore.tileRegionMetadata(forId: region.id) { (result) in
        metadataResults[region.id] = result
        taskGroup.leave()
      }
    }
    
    taskGroup.notify(queue: .main) {
      let firstError = geomteryResults.first { (key,result_and_region) in
        switch result_and_region.0 {
        case .failure:
          return true
        case .success:
          return false
        }
      }
      
      if let firstError = firstError {
        switch firstError.value.0 {
        case .failure(let error):
          rejecter("convertRegionsToJSON", error.localizedDescription, error)
          return
        case .success:
          fatalError("convertRegionsToJson:Expected failure but was success")
        }
      }
      
      let results = geomteryResults.map { (id, result) -> (String, (Geometry,TileRegion, [String:Any]?)) in
        switch result.0 {
        case .failure(_):
          fatalError("convertRegionsToJson:Expected success but was failure")
        case .success(let geometry):
          return (id, (geometry,result.1,(try? metadataResults[id]?.get()) as? [String:Any]))
        }
      }
      
      resolve(results.map { (id, geometry_region_metadata) -> [String:Any] in
        let (geometry, region, metadata) = geometry_region_metadata
        let ret = self.convertRegionToJSON(region: region, geometry: geometry, metadata: metadata)
        var pack = self.tileRegionPacks[region.id] ?? TileRegionPack(
          name: region.id,
          state: .unknown,
          progress: self.toProgress(region: region),
          metadata: logged("RNMBXOfflineModule.getPacks metadata is null") { metadata } ?? [:]
        )
        
        if ((region.hasCompleted())) {
          pack.state = .complete
        }
        
        self.tileRegionPacks[region.id] = pack
        
        return ret
      })
    }
  }
  
  func convertRegionToJSON(region: TileRegion, geometry: Geometry, metadata: [String:Any]?) -> [String:Any] {
    let bb = RNMBXFeatureUtils.boundingBox(geometry: geometry)
    
    if let bb = bb {
      let jsonBounds = [
        bb.northEast.longitude, bb.northEast.latitude,
        bb.southWest.longitude, bb.southWest.latitude
      ]
      
      let completed = (region.completedResourceCount == region.requiredResourceCount)

      var metadata : [String:Any] = metadata ?? [:]
      metadata["name"] = region.id
      
      var result : [String:Any] = [
        "requiredResourceCount": region.requiredResourceCount,
        "completedResourceCount": region.completedResourceCount,
        "completedResourceSize": region.completedResourceSize,
        "state": completed ? State.complete.rawValue : State.unknown.rawValue,
        "metadata": String(data:try! JSONSerialization.data(withJSONObject: metadata, options: [.prettyPrinted]), encoding: .utf8),
        "bounds": jsonBounds
      ]

      if region.requiredResourceCount > 0 {
        result["percentage"] = region.toPercentage()
      } else {
        result["percentage"] = nil
      }
      if let expires = region.expires {
        result["expires"] = expires.toJSONString()
      }

      return result
    }
    return [:]
  }
    
  func toProgress(region: TileRegion) -> TileRegionLoadProgress? {
    return TileRegionLoadProgress(completedResourceCount: region.completedResourceCount, completedResourceSize: region.completedResourceSize, erroredResourceCount: 0, requiredResourceCount: region.requiredResourceCount, loadedResourceCount: 0, loadedResourceSize: 0)
  }
  
  func convertPointPairToBounds(_ bounds: Geometry) -> Geometry {
    guard case .geometryCollection(let gc) = bounds else {
      return bounds
    }
    let geometries = gc.geometries
    guard geometries.count == 2 else {
      return bounds
    }
    guard case .point(let g0) = geometries[0] else {
      return bounds
    }
    guard case .point(let g1) = geometries[1] else {
      return bounds
    }
    let pt0 = g0.coordinates
    let pt1 = g1.coordinates
    return .polygon(Polygon([
      [
        pt0,
        CLLocationCoordinate2D(latitude: pt0.latitude, longitude: pt1.longitude),
        pt1,
        CLLocationCoordinate2D(latitude: pt1.latitude, longitude: pt0.longitude)
      ]
    ]))
  }
  
  func _sendEvent(_ name:String, event: RNMBXEvent) {
    if !hasListeners {
      return
    }
    self.sendEvent(withName: name, body: event.toJSON())
  }

  func _makeRegionStatusPayload(_ name:String, progress: TileRegionLoadProgress?, state: State, metadata:[String:Any]?) -> [String:Any?] {
    var result : [String:Any?] = [:]
    if let progress = progress {
      result = [
        "state": (progress.hasCompleted()) ? State.complete.rawValue : state.rawValue,
        "name": name,
        "percentage": progress.toPercentage(),
        "completedResourceCount": progress.completedResourceCount,
        "completedResourceSize": progress.completedResourceSize,
        "erroredResourceCount": progress.erroredResourceCount,
        "loadedResourceSize": progress.loadedResourceSize,
        "loadedResourceCount": progress.loadedResourceCount,
        "requiredResourceCount": progress.requiredResourceCount
      ]
    } else {
      result = [
        "state": state.rawValue,
        "name": name,
        "percentage": nil
      ]
    }
    if let metadata = metadata {
      result["metadata"] = metadata
    }
    return result
  }
  
  func _makeRegionStatusPayload(pack: TileRegionPack) -> [String:Any?] {
    return _makeRegionStatusPayload(pack.name, progress: pack.progress, state: pack.state, metadata: pack.metadata)
  }
  
  func makeProgressEvent(_ name: String, progress: TileRegionLoadProgress, state: State) -> RNMBXEvent {
    RNMBXEvent(type: .offlineProgress, payload: self._makeRegionStatusPayload(name, progress: progress, state: state, metadata: nil))
  }
  
  func offlinePackProgressDidChange(progress: TileRegionLoadProgress, metadata: [String:Any], state: State) {
    if self.shouldSendProgressEvent(progress: progress, state: state) {
      let event = makeProgressEvent(metadata["name"] as! String, progress: progress, state: state)
      self._sendEvent(Callbacks.progress.rawValue, event: event)
    }
  }
  
  func offlinePackDidReceiveError(name: String, error: Error) {
    let event = RNMBXEvent(type: .offlineError, payload: ["name": name, "message": error.localizedDescription])
    self._sendEvent(Callbacks.error.rawValue, event: event)
  }
}
// MARK: progress throttle

extension RNMBXOfflineModule {
  @objc
  func setProgressEventThrottle(_ throttleValue: NSNumber) {
    progressEventThrottle.waitBetweenEvents = throttleValue.doubleValue
  }
  

  func shouldSendProgressEvent(progress: TileRegionLoadProgress, state: State) -> Bool
  {
    let currentTimestamp: Double = CACurrentMediaTime() * 1000.0
    
    guard let lastSentState = progressEventThrottle.lastSentState, lastSentState == state else {
      progressEventThrottle.lastSentState = state
      progressEventThrottle.lastSentTimestamp = currentTimestamp
      return true
    }
    
    guard let waitBetweenEvents = progressEventThrottle.waitBetweenEvents,
          let lastSentTimestamp = progressEventThrottle.lastSentTimestamp else {
      progressEventThrottle.lastSentTimestamp = currentTimestamp
      return true;
    }
    
    if (currentTimestamp - lastSentTimestamp > waitBetweenEvents) {
      progressEventThrottle.lastSentTimestamp = currentTimestamp
      return true;
    }
     
    return false;
  }
}

extension TileRegionLoadProgress {
  func toPercentage() -> Float {
    return Float(100.0) * Float(completedResourceCount) / Float(requiredResourceCount);
  }
  func hasCompleted() -> Bool {
    return (completedResourceCount == requiredResourceCount)
  }
}

extension TileRegion {
  func toPercentage() -> Float {
    return Float(100.0) * Float(completedResourceCount) / Float(requiredResourceCount)
  }
  func hasCompleted() -> Bool {
    return (completedResourceCount == requiredResourceCount)
  }
}
