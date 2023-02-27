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



@objc(RCTMGLOfflineModule)
class RCTMGLOfflineModule: RCTEventEmitter {
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
    return OfflineManager(resourceOptions: .init(accessToken: MGLModule.accessToken!))
  }()
  
  lazy var offlineRegionManager: OfflineRegionManager = {
    return OfflineRegionManager(resourceOptions: .init(accessToken: MGLModule.accessToken!))
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
          self.bounds = logged("RCTMGLOfflineModule.TileRegionPack: cannot decode bounds") {
            let jsonData = try JSONSerialization.data(withJSONObject: bounds)
            return try JSONDecoder().decode(Geometry.self, from: jsonData)
          }
        }
        if let zoomRange = rnMetadata["zoomRange"] as? Any {
          self.zoomRange = logged("RCTMGLOfflineModule.TileRegionPack: cannot decode zoomRange") {
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
        "bounds": logged("RCTMGLOfflineModule.TileRegionPack: cannot encode bounds") { try JSONSerialization.jsonObject(with: try! JSONEncoder().encode(bounds)) },
        "zoomRange": logged("RCTMGLOfflineModule.TileRegionPack: cannot encode zoomRange") { try JSONSerialization.jsonObject(with: try! JSONEncoder().encode(zoomRange))}
      ]
      self.metadata = metadata
    }

    var name: String
    var cancelable: Cancelable? = nil
    var progress : TileRegionLoadProgress? = nil
    var state : State = .inactive
    var metadata : [String:Any]? = nil

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
  func startObserving() {
    super.startObserving()
    hasListeners = true
  }
  
  @objc override
  func stopObserving() {
    super.stopObserving()
    hasListeners = false
  }
  
  @objc
  override
  static func requiresMainQueueSetup() -> Bool {
      return true
  }
  
  @objc
  override
  func constantsToExport() -> [AnyHashable: Any]! {
    return [:]
  }
  
  
  @objc
  override
  func supportedEvents() -> [String] {
    return [Callbacks.error.rawValue, Callbacks.progress.rawValue]
  }
  
  func convertRegionToJSON(region: TileRegion, geometry: Geometry, metadata: [String:Any]?) -> [String:Any] {
    let bb = RCTMGLFeatureUtils.boundingBox(geometry: geometry)
    
    var result : [String:Any] = [:]
    if let bb = bb {
      let jsonBounds = [
        bb.northEast.longitude, bb.northEast.latitude,
        bb.southWest.longitude, bb.southWest.latitude
      ]
      
      let completed = (region.completedResourceCount == region.requiredResourceCount)
      
      result["requiredResourceCount"] = region.requiredResourceCount
      result["completedResourceCount"] = region.completedResourceCount
      result["completedResourceSize"] = region.completedResourceSize
      result["state"] = completed ? State.complete.rawValue : State.unknown.rawValue

      var metadata : [String:Any] = metadata ?? [:]
      metadata["name"] = region.id
      
      if region.requiredResourceCount > 0 {
        let percentage = Float(100.0) * Float(region.completedResourceCount) / Float(region.requiredResourceCount)
        result["percentage"] = percentage
      } else {
        result["percentage"] = nil
      }
      if let expires = region.expires {
        result["expires"] = expires.toJSONString()
      }

      result["metadata"] = String(data:try! JSONSerialization.data(withJSONObject: metadata, options: [.prettyPrinted]), encoding: .utf8)
      
      result["bounds"] = jsonBounds
    }
    return result
  }
  
  func toProgress(region: TileRegion) -> TileRegionLoadProgress? {
    return TileRegionLoadProgress(completedResourceCount: region.completedResourceCount, completedResourceSize: region.completedResourceSize, erroredResourceCount: 0, requiredResourceCount: region.requiredResourceCount, loadedResourceCount: 0, loadedResourceSize: 0)
  }
  
  func convertRegionToJson(regions: [TileRegion], resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
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
          rejecter("Error", error.localizedDescription, error)
          return
        case .success:
          fatalError("Expected failure but was success")
        }
      }

      let results = geomteryResults.map { (id, result) -> (String, (Geometry,TileRegion, [String:Any]?)) in
        switch result.0 {
        case .failure(_):
          fatalError("Expected failuer but was success")
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
          metadata: logged("RCTMGLOfflineModule.getPacks metadata is null") { metadata } ?? [:]
        )

        if ((region.completedResourceCount == region.completedResourceSize)) {
          pack.state = .complete
        }

        self.tileRegionPacks[region.id] = pack

        return ret
      })
    }
  }
  
  @objc
  func getPacks(_ resolve : @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      self.tileStore.allTileRegions { result in
        switch result {
        case .success(let regions):
          self.convertRegionToJson(regions: regions, resolve: resolve, rejecter: rejecter)
          // self.convertRegionToJson(regions: regions, resolve: resolve)
          // resolve(self.convertRegionToJson(regions: regions))
        case .failure(let error):
          rejecter("TileStoreError", error.localizedDescription, error)
        }
      }
      
/*
      self.offlineManager.allStylePacks { (result) in
        switch result {
        case .success(let packs):
          resolve(self.convertPacksToJson(packs: packs))
        case .failure(let error):
          rejecter(error.localizedDescription, error.localizedDescription, error)
        }
      }*/
    }
    
    
    
//    dispatch_async(dispatch_get_main_queue(), ^{
      /*
            NSArray<MGLOfflinePack *> *packs = [[MGLOfflineStorage sharedOfflineStorage] packs];
            
            if (packs == nil) {
                // packs have not loaded yet
                [self->packRequestQueue addObject:resolve];
                return;
            }

            resolve([self _convertPacksToJson:packs]);
        });*/
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
  
  func _sendEvent(_ name:String, event: RCTMGLEvent) {
    if !hasListeners {
      return
    }
    self.sendEvent(withName: name, body: event.toJSON())
  }

  func _makeRegionStatusPayload(_ name:String, progress: TileRegionLoadProgress?, state: State, metadata:[String:Any]?) -> [String:Any?] {
    var result : [String:Any?] = [:]
    if let progress = progress {
      let progressPercentage =  Float(progress.completedResourceCount) / Float(progress.requiredResourceCount)
      
      result = [
        "state": (progress.completedResourceCount == progress.requiredResourceCount) ? State.complete.rawValue : state.rawValue,
        "name": name,
        "percentage": progressPercentage * 100.0,
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
  
  func makeProgressEvent(_ name: String, progress: TileRegionLoadProgress, state: State) -> RCTMGLEvent {
    RCTMGLEvent(type: .offlineProgress, payload: self._makeRegionStatusPayload(name, progress: progress, state: state, metadata: nil))
  }
  
  func offlinePackProgressDidChange(progress: TileRegionLoadProgress, metadata: [String:Any], state: State) {
    if self.shouldSendProgressEvent(progress: progress, state: state) {
      let event = makeProgressEvent(metadata["name"] as! String, progress: progress, state: state)
      self._sendEvent(Callbacks.progress.rawValue, event: event)
    }
  }
  
  func offlinePackDidReceiveError(name: String, error: Error) {
    let event = RCTMGLEvent(type: .offlineError, payload: ["name": name, "message": error.localizedDescription])
    self._sendEvent(Callbacks.error.rawValue, event: event)
  }
  
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

        var bounds = self.convertPointPairToBounds(RCTMGLFeatureUtils.fcToGeomtry(boundsFC))

        let actPack = RCTMGLOfflineModule.TileRegionPack(
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
  
  func startLoading(pack: TileRegionPack) {
    let id = pack.name
    guard let bounds = pack.bounds else {
      RCTMGLLogError("RCTMGLOfflineModule.startLoading failed as there are no bounds in pack")
      return
    }
    guard let zoomRange = pack.zoomRange else {
      RCTMGLLogError("RCTMGLOfflineModule.startLoading failed as there is no zoom range in pack")
      return
    }
    guard let styleURI = pack.styleURI else {
      RCTMGLLogError("RCTMGLOfflineModule.startLoading failed as there is no styleURI in pack")
      return
    }
    guard let metadata = pack.metadata else {
      RCTMGLLogError("RCTMGLOfflineModule.startLoading failed as there is no metadata in pack")
      return
    }
    
    let stylePackLoadOptions = StylePackLoadOptions(glyphsRasterizationMode: .ideographsRasterizedLocally, metadata: pack.metadata)
    
    let descriptorOptions = TilesetDescriptorOptions(
      styleURI: styleURI,
      zoomRange: zoomRange,
      stylePackOptions: stylePackLoadOptions
    )
    let tilesetDescriptor = self.offlineManager.createTilesetDescriptor(for: descriptorOptions)

    let loadOptions = TileRegionLoadOptions(
      geometry: bounds, // RCTMGLFeatureUtils.geometryToGeometry(bounds),
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
      case .success(let value):
        DispatchQueue.main.async {
          if let progess = lastProgress {
            self.offlinePackProgressDidChange(progress: progess, metadata: metadata, state: .complete)
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

  func _getPack(fromName: String) -> TileRegionPack? {
    return self.tileRegionPacks[fromName]
  }

  @objc
  func getPackStatus(_ name: String,
                     resolver: @escaping RCTPromiseResolveBlock,
                     rejecter: @escaping RCTPromiseRejectBlock) {
    guard let pack = self._getPack(fromName: name) else {
      resolver(nil)
      return
    }
    
    tileStore.tileRegionMetadata(forId: name) { result in
      switch result {
      case .failure(let error):
        Logger.log(level:.error, message: "Unable to fetch metadata for \(name)")
        rejecter("RCTMGLOfflineModule.getPackStatus", error.localizedDescription, error)
      case .success(let metadata):
        var pack = self.tileRegionPacks[name] ?? TileRegionPack(
          name: name,
          metadata: logged("RCTMGLOfflineModule.getPackStatus") { metadata as? [String:Any] } ?? [:]
        )
        self.tileRegionPacks[name] = pack
        resolver(self._makeRegionStatusPayload(pack: pack))
      }
    }
  }

  
  @objc
  func resumePackDownload(_ name: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock)
  {
    if let pack = _getPack(fromName: name) {
      self.startLoading(pack: pack)
    }
  }
  
  @objc
  func pausePackDownload(_ name: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock)
  {
    if let pack = _getPack(fromName: name) {
      pack.cancelable?.cancel()
      resolver(nil)
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
    guard let pack = _getPack(fromName: name) else {
      return resolver(nil)
    }
    
    guard pack.state != .invalid else {
      let error = NSError(domain:"RCTMGLErororDomain", code: 1, userInfo: [NSLocalizedDescriptionKey: "Pack has already beend deleted"])
      return rejecter("deletePack", error.description, error)
    }
    
    self.tileStore.removeTileRegion(forId: name)
    self.tileRegionPacks[name]!.state = .invalid
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
}

// MARK: progress throttle

extension RCTMGLOfflineModule {
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

