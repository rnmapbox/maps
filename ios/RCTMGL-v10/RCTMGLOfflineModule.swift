import Foundation
import MapboxMaps

@objc(RCTMGLOfflineModule)
class RCTMGLOfflineModule: RCTEventEmitter {
  
  enum Callbacks : String {
    case error = "MapboOfflineRegionError"
    case progress = "MapboxOfflineRegionProgress"
  }
  
  lazy var offlineManager : OfflineManager = {
    return OfflineManager(resourceOptions: .init(accessToken: MGLModule.accessToken!))
  }()
  
  lazy var tileStore : TileStore = {
    return TileStore.default
  }()
  
  @objc
  override
  static func requiresMainQueueSetup() -> Bool {
      return true
  }
  
  @objc
  override
  func constantsToExport() -> [AnyHashable: Any]! {
      return [
          "foo": "bar"
      ];
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
  
  func boundingBox(geometry: Geometry) -> BoundingBox? {
    switch geometry {
    case .polygon(let polygon):
      return BoundingBox(from:  polygon.outerRing.coordinates)
    case .lineString(let lineString):
      return BoundingBox(from: lineString.coordinates)
    case .point(let point):
      return BoundingBox(from: [point.coordinates])
    case .multiPoint(let multiPoint):
      return BoundingBox(from: multiPoint.coordinates)
    case .multiPolygon(let multiPolygon):
      let coordinates : [[[LocationCoordinate2D]]] = multiPolygon.coordinates;
      return BoundingBox(from: Array(coordinates.joined().joined()))
    case .geometryCollection(let collection):
      let geometries = collection.geometries
      let coordinates : [[LocationCoordinate2D]] = geometries.map { (geometry) in
        if let bb = boundingBox(geometry: geometry) {
          return [bb.northEast,bb.southWest]
        } else {
          return []
        }
      };
      
      return BoundingBox(from: Array(coordinates.joined()))
    case .multiLineString(let multiLineString):
      let coordinates = multiLineString.coordinates
      return BoundingBox(from: Array(coordinates.joined()))
    }
  }
  
  func convertRegionToJSON(region: TileRegion, geometry: Geometry) -> [String:Any] {
    let bb = boundingBox(geometry: geometry)
    
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
  
  /*
  func convertRegionToJson(regions: [TileRegion]) -> [[String:Any]] {
    regions.map { (region: TileRegion) in
      switch result {
      case .success(let regions):
        resolve(self.convertRegionToJson(regions: regions))
      case .failure(let error):
        rejecter("TileStoreError", error.localizedDescription, error)
      }
    }
  }
  
  func allTileRegions() -> [[String:Any]] {
    tileStore.allTileRegions { result in
      
    }
  }*/
  
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
  
  
  func convert(_ geometry: Turf.Geometry) -> MapboxCommon.Geometry {
    switch geometry {
    case .geometryCollection(let collection):
      return MapboxCommon.Geometry(geometryCollection: collection.geometries.map { convert($0) })
    case .lineString(let lineString):
      return MapboxCommon.Geometry(line: lineString.coordinates)
    case .multiLineString(let multiLineString):
      return MapboxCommon.Geometry(multiLine: multiLineString.coordinates)
    case .multiPoint(let multiPoint):
      return MapboxCommon.Geometry(multiPoint: multiPoint.coordinates)
    case .multiPolygon(let multiPolygon):
      return MapboxCommon.Geometry(multiPolygon: multiPolygon.coordinates)
    case .point(let point):
      let value = NSValue(cgPoint: CGPoint(x: point.coordinates.longitude, y: point.coordinates.latitude))
      return MapboxCommon.Geometry(point: value)
    case .polygon(let polygon):
      return MapboxCommon.Geometry(polygon: polygon.coordinates)
    }
  }
  
  func asGeometryCollection(_ collection: FeatureCollection) -> Turf.Geometry {
    return .geometryCollection(GeometryCollection(geometries: collection.features.map { $0.geometry }))
  }
  
  @objc
  func createPack(_ options: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      do {
        let bounds = options["bounds"] as! String
        let boundsData = bounds.data(using: .utf8)
        
        //let geometry = try! JSONDecoder().decode(Geometry.self, from: boundsData!)
        let boundsFC = try! JSONDecoder().decode(FeatureCollection.self, from: boundsData!)
        
        
        let descriptorOptions = TilesetDescriptorOptions(
          styleURI: options["styleURL"] as! String,
          minZoom: (options["minZoom"] as! NSNumber).uint8Value,
          maxZoom: (options["maxZoom"] as! NSNumber).uint8Value,
          stylePack: nil
        )
        let tilesetDescriptor = self.offlineManager.createTilesetDescriptor(for: descriptorOptions)
        
        
        let metadataStr = options["metadata"] as! String
        
        let metadata = try! JSONSerialization.jsonObject(with: metadataStr.data(using: .utf8)!, options: [])
        
        print("Converted: ", self.convert(self.asGeometryCollection(boundsFC)))
        print("metadata:", metadata)
        let id = "foo"
        let loadOptions = TileRegionLoadOptions(
          geometry: self.convert(self.asGeometryCollection(boundsFC)),
          descriptors: [tilesetDescriptor],
          metadata: metadata,
          acceptExpired: true,
          networkRestriction: .none,
          averageBytesPerSecond: nil)
        self.tileStore.loadTileRegion(forId: id, loadOptions: loadOptions!) { result in
          switch result {
          case .success(let value):
            resolver(["todo":"tood"])
          case .failure(let error):
            rejecter("LoadTileRegionError", error.localizedDescription, error)
          }
        }
      } catch {
        
      }
    }
    
    //offlineManager.createTilesetDescriptor(for: <#T##TilesetDescriptorOptions#>)
    
    /*
     
     NSString *styleURL = options[@"styleURL"];
         MGLCoordinateBounds bounds = [RCTMGLUtils fromFeatureCollection:options[@"bounds"]];
         
         id<MGLOfflineRegion> offlineRegion = [[MGLTilePyramidOfflineRegion alloc] initWithStyleURL:[NSURL URLWithString:styleURL]
                                                                                   bounds:bounds
                                                                                   fromZoomLevel:[options[@"minZoom"] doubleValue]
                                                                                   toZoomLevel:[options[@"maxZoom"] doubleValue]];
         NSData *context = [self _archiveMetadata:options[@"metadata"]];
         
         [[MGLOfflineStorage sharedOfflineStorage] addPackForRegion:offlineRegion
                                                   withContext:context
                                                   completionHandler:^(MGLOfflinePack *pack, NSError *error) {
                                                      if (error != nil) {
                                                          reject(@"createPack", error.description, error);
                                                          return;
                                                      }
                                                      resolve([self _convertPackToDict:pack]);
                                                      [pack resume];
                                                   }];
     */
  }
}
