import Foundation
import MapboxMaps

@objc(RNMBXOfflineModuleLegacy)
class RNMBXOfflineModuleLegacy: RCTEventEmitter {
  final let CompleteRegionDownloadState = 2
  
  lazy var offlineRegionManager: OfflineRegionManager = {
    #if RNMBX_11
    return OfflineRegionManager()
    #else
    return OfflineRegionManager(resourceOptions: .init(accessToken: RNMBXModule.accessToken!))
    #endif
  }()

  @objc
  override
  func supportedEvents() -> [String] {
    return []
  }

  @objc
  override
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  private func makeRegionStatusPayload(name: String, status: OfflineRegionStatus) -> [String:Any?] {
    let progressPercentage = status.requiredResourceCount > 0 ? Double(status.completedResourceCount) / Double(status.requiredResourceCount) : 0
    let percentage = min(ceil(Double(progressPercentage) * 100.0), 100.0)
    let isCompleted = percentage == 100.0
    let state = isCompleted ? CompleteRegionDownloadState : status.downloadState.rawValue
    let result: [String:Any?] = [
        "state": state,
        "name": name,
        "percentage": percentage,
        "completedResourceCount": status.completedResourceCount,
        "completedResourceSize": status.completedResourceSize,
        "completedTileSize": status.completedTileSize,
        "completedTileCount": status.completedTileCount,
        "requiredResourceCount": status.requiredResourceCount
      ]

      return result
    }


  func convertPointPairToBounds(_ bounds: Geometry) -> CoordinateBounds? {
    guard case .geometryCollection(let gc) = bounds else {
      return nil
    }
    let geometries = gc.geometries

    guard geometries.count == 2 else {
      return nil
    }
    guard case .point(let g0) = geometries[0] else {
      return nil
    }
    guard case .point(let g1) = geometries[1] else {
      return nil
    }

    let pt0 = CLLocationCoordinate2D(latitude: g0.coordinates.latitude, longitude: g0.coordinates.longitude)
    let pt1 = CLLocationCoordinate2D(latitude: g1.coordinates.latitude, longitude: g1.coordinates.longitude)

    return CoordinateBounds(southwest: pt0, northeast: pt1)
  }

func convertRegionToPack(region: OfflineRegion) -> [String: Any]? {
    var metadataString: String?

    guard let bb = region.getTilePyramidDefinition()?.bounds else { return [:] }

    do {
      let metadata = region.getMetadata()

      metadataString = String(data: metadata, encoding: .utf8)

      if (metadataString == nil) {
        // Handle archived data from V9
        metadataString = NSKeyedUnarchiver.unarchiveObject(with: metadata) as? String
      }


      let jsonBounds = [
         [bb.east, bb.north],
         [bb.west, bb.south]
      ]

      let pack: [String: Any] = [
        "metadata": metadataString,
        "bounds": jsonBounds
      ]

      return pack
    } catch {
      print("convertRegionToPack error: \(error)")
      return nil
    }
  }

  func createPackCallback(region: OfflineRegion,
                          metadata: Data,
                          resolver: @escaping RCTPromiseResolveBlock,
                          rejecter: @escaping RCTPromiseRejectBlock) {

    region.setOfflineRegionDownloadStateFor(.active)
    region.setMetadata(metadata) { [weak self] result in
      switch result {
      case let .failure(error):
        print("Error creating offline region: \(error)")
        rejecter("createPack error:", error.localizedDescription, error)

      case .success():
        resolver(self?.convertRegionToPack(region: region))
      }
    }
  }

func getRegionByName(name: String, offlineRegions: [OfflineRegion]) -> OfflineRegion? {
    for region in offlineRegions {
      var metadata:[String: Any] = [:]

      do {
        let byteMetadata = region.getMetadata()

       // Handle archived data from V9
        let metadataString = NSKeyedUnarchiver.unarchiveObject(with: byteMetadata) as? String

        if (metadataString != nil) {
          let data = metadataString!.data(using: .utf8)
          metadata = try JSONSerialization.jsonObject(with: data!, options: []) as! [String: Any]
        } else {
          metadata = try JSONSerialization.jsonObject(with: byteMetadata, options: []) as! [String:Any]
        }

        if (name == metadata["name"] as! String) {
          return region
        }
      } catch {
        print("getRegionByName error: \(error)")
        return nil
      }
    }

    return nil
  }

  // MARK: react methods
  
  @objc
  func createPack(_ options: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      do {
        let metadataStr = options["metadata"] as! String
        let styleURL = options["styleURL"] as! String

        let boundsStr = options["bounds"] as! String
        let boundsData = boundsStr.data(using: .utf8)
        var boundsFC = try JSONDecoder().decode(FeatureCollection.self, from: boundsData!)

        guard let bounds = self.convertPointPairToBounds(RNMBXFeatureUtils.fcToGeomtry(boundsFC)),
              let metadataBytes = metadataStr.data(using: .utf8)
        else {
          rejecter("createPack error:", "No metadata or bounds set", nil)
          return
        }

        let offlineRegionDef = OfflineRegionTilePyramidDefinition(
          styleURL: styleURL,
          bounds: bounds,
          minZoom: options["minZoom"] as! Double,
          maxZoom: options["maxZoom"] as! Double,
          pixelRatio: Float(UIScreen.main.scale),
          glyphsRasterizationMode: .ideographsRasterizedLocally)

        self.offlineRegionManager.createOfflineRegion(for: offlineRegionDef) { [weak self] result in
          switch result {
          case let .failure(error):
            print("Error creating offline region: \(error)")
            rejecter("createPack", error.localizedDescription, error)

          case let .success(region):
            self?.createPackCallback(region: region,
                                    metadata: metadataBytes,
                                    resolver: resolver,
                                    rejecter: rejecter)
          }
        }
      } catch {
        rejecter("createPack", error.localizedDescription, error)
      }
    }
  }

  @objc
  func getPacks(_ resolve : @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      self.offlineRegionManager.offlineRegions { result in
        switch result {
        case .success(let regions):
          var payload = [[String: Any]]()

          for region in regions {
            if let pack = self.convertRegionToPack(region: region) {
              payload.append(pack)
            }
          }

          resolve(payload)
        case .failure(let error):
          rejecter("getPacks error", error.localizedDescription, error)
        }
      }
    }
  }

  @objc
  func deletePack(_ name: String,
                  resolver: @escaping RCTPromiseResolveBlock,
                  rejecter: @escaping RCTPromiseRejectBlock)
  {
    DispatchQueue.main.async {
      self.offlineRegionManager.offlineRegions { result in
        switch result {
        case .success(let regions):
          guard let region = self.getRegionByName(name: name, offlineRegions: regions) else {
            resolver(nil);
            print("deleteRegion - Unknown offline region");
            return
          }

          region.setOfflineRegionDownloadStateFor(.inactive)
          region.purge { result in
            switch result {
            case let .failure(error):
              rejecter("deleteRegion error", error.localizedDescription, error)

            case .success:
              print("deleteRegion done");
              resolver(nil);
            }
          }
        case .failure(let error):
          rejecter("deleteRegion error", error.localizedDescription, error)
        }
      }
    }
  }

  @objc
  func invalidatePack(_ name: String,
                  resolver: @escaping RCTPromiseResolveBlock,
                  rejecter: @escaping RCTPromiseRejectBlock)
  {
    DispatchQueue.main.async {
      self.offlineRegionManager.offlineRegions { result in
        switch result {
        case .success(let regions):
          guard let region = self.getRegionByName(name: name, offlineRegions: regions) else {
            resolver(nil);
            print("invalidatePack - Unknown offline region");
            return
          }

          region.invalidate { result in
            switch result {
            case let .failure(error):
              rejecter("invalidatePack error", error.localizedDescription, error)

            case .success:
              print("invalidatePack done");
              resolver(nil);
            }
          }
        case .failure(let error):
          rejecter("invalidatePack error", error.localizedDescription, error)
        }
      }
    }
  }

  @objc
  func getPackStatus(_ name: String,
                  resolver: @escaping RCTPromiseResolveBlock,
                  rejecter: @escaping RCTPromiseRejectBlock)
  {
    DispatchQueue.main.async {
      self.offlineRegionManager.offlineRegions { result in
        switch result {
        case .success(let regions):
          guard let region = self.getRegionByName(name: name, offlineRegions: regions) else {
            resolver(nil);
            print("getPackStatus - Unknown offline region");
            return
          }

          region.getStatus { result in
            switch result {
            case let .success(status):
              print("getPackStatus done");
              resolver(self.makeRegionStatusPayload(name: name, status: status));

            case let .failure(error):
              rejecter("getPackStatus error", error.localizedDescription, error)
            }
          }
        case .failure(let error):
          rejecter("getPackStatus error", error.localizedDescription, error)
        }
      }
    }
  }

  @objc
  func pausePackDownload(_ name: String,
                  resolver: @escaping RCTPromiseResolveBlock,
                  rejecter: @escaping RCTPromiseRejectBlock)
  {
    DispatchQueue.main.async {
      self.offlineRegionManager.offlineRegions { result in
        switch result {
        case .success(let regions):
          guard let region = self.getRegionByName(name: name, offlineRegions: regions) else {
            resolver(nil);
            print("pausePackDownload - Unknown offline region");
            return
          }

          region.setOfflineRegionDownloadStateFor(.inactive)
          resolver(nil);

        case .failure(let error):
          rejecter("pausePackDownload error", error.localizedDescription, error)
        }
      }
    }
  }

  @objc
  func resumePackDownload(_ name: String,
                  resolver: @escaping RCTPromiseResolveBlock,
                  rejecter: @escaping RCTPromiseRejectBlock)
  {
    DispatchQueue.main.async {
      self.offlineRegionManager.offlineRegions { result in
        switch result {
        case .success(let regions):
          guard let region = self.getRegionByName(name: name, offlineRegions: regions) else {
            resolver(nil);
            print("resumePackDownload - Unknown offline region");
            return
          }

          region.setOfflineRegionDownloadStateFor(.active)
          resolver(nil);

        case .failure(let error):
          rejecter("resumePackDownload error", error.localizedDescription, error)
        }
      }
    }
  }

  @objc
  func resetDatabase(_ resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock)
  {
    print("resetDatabase started");
    DispatchQueue.main.async {
      var purgedCount = 0
      self.offlineRegionManager.offlineRegions { result in
        switch result {
        case .success(let regions):
          if (regions.count ==  0) {resolver(nil);}

          for region in regions {
            region.setOfflineRegionDownloadStateFor(.inactive)
            region.purge { result in
              switch result {
              case let .failure(error):
                rejecter("resetDatabase error", error.localizedDescription, error)

              case .success:
                print("pack purged");
                purgedCount += 1
                if purgedCount == regions.count {
                  print("resetDatabase done: \(regions.count) where purged");
                  resolver(nil);
                }
              }
            }

          }


        case .failure(let error):
          rejecter("resetDatabase error", error.localizedDescription, error)
        }
      }
    }
  }


 @objc
  func migrateOfflineCache(_ resolve : @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let bundleIdentifier = Bundle.main.bundleIdentifier!

    let srcPath = "\(NSHomeDirectory())/Library/Application Support/\(bundleIdentifier)/.mapbox/cache.db"
    let srcURL = URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Library/Application Support/\(bundleIdentifier)/.mapbox/cache.db")
    let destURL = URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Library/Application Support/.mapbox/map_data/map_data.db")

    let fileManager = FileManager.default

    if (!fileManager.fileExists(atPath: srcPath)) {
      print("migrateOfflineCache: nothing to migrate")
      resolve(false)
      return
    }

    do {
      try fileManager.createDirectory(at: destURL.deletingLastPathComponent(), withIntermediateDirectories: true, attributes: nil)
      try fileManager.moveItem(at: srcURL, to: destURL)
      print("migrateOfflineCache done:")
      resolve(true)
    } catch {
      reject("migrateOfflineCache error:", error.localizedDescription, error)
    }
  }
}
