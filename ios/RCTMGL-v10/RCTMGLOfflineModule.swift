import Foundation
import MapboxMaps

@objc(RCTMGLOfflineModule)
class RCTMGLOfflineModule: RCTEventEmitter {
  var hasListeners = false
  
  enum Callbacks : String {
    case error = "MapboOfflineRegionError"
    case progress = "MapboxOfflineRegionProgress"
  }
  
  enum State : String {
    case invalid
    case inactive
    case active
    case complete
  }
  
  lazy var offlineManager : OfflineManager = {
    return OfflineManager(resourceOptions: .init(accessToken: MGLModule.accessToken!))
  }()
  
  lazy var tileStore : TileStore = {
    return TileStore.default
  }()
  
  struct TileRegionPack {
    var name: String
    var cancelable: Cancelable? = nil
    var progress : TileRegionLoadProgress? = nil
    var state : State = .inactive
  }
  
  lazy var tileRegionPacks : [String: TileRegionPack] = [:]
  
  
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
  
  func convertPackToDict(pack: StylePack) -> [String:Any] {
    return [:]
    // format bounds
    /*
    MGLTilePyramidOfflineRegion *region = (MGLTilePyramidOfflineRegion *)pack.region;
    if (region == nil) {
        return nil;
    }
    
    NSArray *jsonBounds = @[
      @[@(region.bounds.ne.longitude), @(region.bounds.ne.latitude)],
      @[@(region.bounds.sw.longitude), @(region.bounds.sw.latitude)]
    ];
    
    // format metadata
    NSDictionary *metadata = [self _unarchiveMetadata:pack];
    NSData *jsonMetadata = [NSJSONSerialization dataWithJSONObject:metadata
                                            options:0
                                            error:nil];
    return @{
      @"metadata": [[NSString alloc] initWithData:jsonMetadata encoding:NSUTF8StringEncoding],
      @"bounds": jsonBounds
    };*/
  }
  
  func convertPacksToJson(packs: [StylePack]) -> [[String:Any]] {
    packs.map { return convertPackToDict(pack:$0) }
  }
  
  func convertRegionToJSON(region: TileRegion, geometry: Geometry) -> [String:Any] {
    let bb = RCTMGLFeatureUtils.boundingBox(geometry: geometry)
    
    var result : [String:Any] = [:]
    if let bb = bb {
      let jsonBounds = [
        bb.northEast.longitude, bb.northEast.latitude,
        bb.southWest.longitude, bb.southWest.longitude
      ]
      
      result["bounds"] = jsonBounds
    }
    return result
  }
  
  //func convertRegionToJSON(region: TileRegion, geometry: Geometry) -> [String:Any] {
    // BoundingBox(from: geometry.)
  //}
  
  func convertRegionToJson(regions: [TileRegion], resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let taskGroup = DispatchGroup()
    
    var results : [String: (Result<Geometry,Error>,TileRegion)] = [:]
    
    for region in regions {
      taskGroup.enter()
      
      tileStore.tileRegionGeometry(forId: region.id) { (result) in
        results[region.id] = (result, region)
        taskGroup.leave()
      }
    }
    
    taskGroup.notify(queue: .main) {
      let firstError = results.first { (key,result_and_region) in
        switch result_and_region.0 {
        case .failure(let error):
          return true
        case .success(let geometry):
          return false
        }
      }
  
      if let firstError = firstError {
        switch firstError.value.0 {
        case .failure(let error):
          rejecter("Error", error.localizedDescription, error)
          return
        case .success(let geometry):
          fatalError("Expected failuer but was success")
        }
      }

      let results = results.map { (id, result) -> (String, (Geometry,TileRegion)) in
        switch result.0 {
        case .failure(_):
          fatalError("Expected failuer but was success")
        case .success(let geometry):
          return (id, (geometry,result.1))
        }
      }
      
      
      
      resolve(results.map { (id, geometry_region) in
        self.convertRegionToJSON(region: geometry_region.1, geometry: geometry_region.0)
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

  func _makeRegionStatusPayload(_ name:String, progress: TileRegionLoadProgress?, state: State) -> [String:Any?] {
    if let progress = progress {
      let progressPercentage =  Float(progress.completedResourceCount) / Float(progress.requiredResourceCount)
      
      return [
        "state": state.rawValue,
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
      return [
        "state": state.rawValue,
        "name": name,
        "percentage": nil
      ]
    }
  }
  
  func _makeRegionStatusPayload(pack: TileRegionPack) -> [String:Any?] {
    return _makeRegionStatusPayload(pack.name, progress: pack.progress, state: pack.state)
  }
  
  func makeProgressEvent(_ name: String, progress: TileRegionLoadProgress, state: State) -> RCTMGLEvent {
    RCTMGLEvent(type: .offlineProgress, payload: self._makeRegionStatusPayload(name, progress: progress, state: state))
  }
  
  func shouldSendProgressEvent() -> Bool {
    return true
  }
  
  func offlinePackProgressDidChange(progress: TileRegionLoadProgress, metadata: [String:Any], state: State) {
    if self.shouldSendProgressEvent() {
      let event = makeProgressEvent(metadata["name"] as! String, progress: progress, state: state)
      self._sendEvent(Callbacks.progress.rawValue, event: event)
    }
  }
  
  @objc
  func createPack(_ options: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      do {
        let boundsStr = options["bounds"] as! String
        let boundsData = boundsStr.data(using: .utf8)
        var boundsFC = try JSONDecoder().decode(FeatureCollection.self, from: boundsData!)

        var bounds = self.convertPointPairToBounds(RCTMGLFeatureUtils.fcToGeomtry(boundsFC))
        
        let descriptorOptions = TilesetDescriptorOptions(
          styleURI: options["styleURL"] as! String,
          minZoom: (options["minZoom"] as! NSNumber).uint8Value,
          maxZoom: (options["maxZoom"] as! NSNumber).uint8Value,
          stylePack: nil
        )
        let tilesetDescriptor = self.offlineManager.createTilesetDescriptor(for: descriptorOptions)
        
        
        let metadataStr = options["metadata"] as! String
        
        let metadata = try JSONSerialization.jsonObject(with: metadataStr.data(using: .utf8)!, options: []) as! [String:Any]

        let id = metadata["name"] as! String
        let loadOptions = TileRegionLoadOptions(
          geometry: bounds, // RCTMGLFeatureUtils.geometryToGeometry(bounds),
          descriptors: [tilesetDescriptor],
          metadata: metadata,
          acceptExpired: true,
          networkRestriction: .none,
          averageBytesPerSecond: nil)

        print("load options: \(loadOptions?.description ?? "n/a")")
        let actPack = RCTMGLOfflineModule.TileRegionPack(
          name: id,
          progress: nil,
          state: .inactive
        )
        self.tileRegionPacks[id] = actPack
        
        resolver([
          "bounds": boundsStr,
          "metadata": String(data:try! JSONSerialization.data(withJSONObject: metadata, options: [.prettyPrinted]), encoding: .utf8)
        ])

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
            print("*** value: \(value)")
            if let progess = lastProgress {
              self.offlinePackProgressDidChange(progress: progess, metadata: metadata, state: .complete)
            }
            self.tileRegionPacks[id]!.state = .complete
          case .failure(let error):
            self.tileRegionPacks[id]!.state = .inactive
            rejecter("createPack", error.localizedDescription, error)
          }
        }
        
        self.tileRegionPacks[id]!.cancelable = task
        
      } catch {
        rejecter("createPack", error.localizedDescription, error)
      }
    }
  }
  
  func _getPack(fromName: String) -> TileRegionPack? {
    return self.tileRegionPacks[fromName]
  }
  
  @objc
  func getPackStatus(_ name: String,
                     resolver: RCTPromiseResolveBlock,
                     rejecter: RCTPromiseRejectBlock) {
    guard let pack = self._getPack(fromName: name) else {
      resolver(nil)
      return
    }
    
    resolver(self._makeRegionStatusPayload(pack: pack))
  }

  
  @objc
  func resumePackDownload(_ name: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock)
  {
    //V10todo start download again
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
    //v10todo
  }
  
  @objc
  func setProgressEventThrottle(_ throttleValue: NSNumber) {
    // v10todo improve progress event listener
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
}
