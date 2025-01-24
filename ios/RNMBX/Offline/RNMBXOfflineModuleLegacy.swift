import Foundation
import MapboxMaps

class TimeoutHandler {
    private weak var delegate: AnyObject?
    private let name: String
    private var timeoutDuration: TimeInterval
    private weak var timer: Timer?
    private let onTimeout: (String, TimeInterval) -> Void
    
    init(name: String,
         timeoutDuration: TimeInterval = 1 * 30,
         delegate: AnyObject? = nil,
         onTimeout: @escaping (String, TimeInterval) -> Void) {
        self.name = name
        self.delegate = delegate
        self.timeoutDuration = timeoutDuration
        self.onTimeout = onTimeout
    }
    
    func startTimer(){
        cancelTimer()

        timer = Timer.scheduledTimer(withTimeInterval: timeoutDuration, repeats: false) { [weak self, weak delegate = self.delegate] _ in
            guard let self = self else { return }
            self.onTimeout(self.name, self.timeoutDuration)
        }
    }
    
    func cancelTimer(){
        timer?.invalidate()
        timer = nil
    }
    
    func start() {
        print("TimeoutHandler start.")
        startTimer()
    }
    
    func reset() {
        print("TimeoutHandler reset.")
        startTimer()
    }
    
    func cancel() {
        print("TimeoutHandler cancel.")
        cancelTimer()
    }
}

@objc(RNMBXOfflineModuleLegacy)
class RNMBXOfflineModuleLegacy: RCTEventEmitter {
  final let CompleteRegionDownloadState = 2

  var hasListeners = false
  private var offlineRegion: OfflineRegion!
  private var defaultTimeoutDuration: TimeInterval = 1 * 30
    
  enum Callbacks : String {
    case error = "MapboOfflineRegionError"
    case progress = "MapboxOfflineRegionProgress"
  }

  enum State : String {
    case invalid
    case inactive
    case active
    case complete
    case incomplete
    case unknown
  }

  lazy var offlineRegionManager: OfflineRegionManager = {
    #if RNMBX_11
    return OfflineRegionManager()
    #else
    return OfflineRegionManager(resourceOptions: .init(accessToken: RNMBXModule.accessToken!))
    #endif
  }()

  @objc
  override
  public func supportedEvents() -> [String] {
    return [Callbacks.error.rawValue, Callbacks.progress.rawValue]
  }

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
  static func requiresMainQueueSetup() -> Bool {
    return true
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

        guard let metadataData = metadataStr.data(using: .utf8),
            let metadata = try JSONSerialization.jsonObject(with: metadataData, options: []) as? [String: Any],
            let name = metadata["name"] as? String else {
          rejecter("createPack error:", "Invalid metadata format or missing name", nil)
          return
        }

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
                print("Success creating offline region")

                region.setMetadata(metadataBytes) { [weak self] result in
                      switch result {
                      case let .failure(error):
                        print("Error creating offline region: \(error)")
                        rejecter("createPack error:", error.localizedDescription, error)

                      case .success():
                        self?.startLoading(for: region, name: name)
                        resolver(self?.convertRegionToPack(region: region))
                      }
                }
          }
        }
      } catch {
        rejecter("createPack", error.localizedDescription, error)
      }
    }
  }

  private func startLoading(for region: OfflineRegion, name: String) {
      let timeoutHandler = TimeoutHandler(name: name, timeoutDuration: self.defaultTimeoutDuration) { [weak self] timeoutName, timeoutDuration in
          guard let self = self else { return }
          
          let timeoutError = OfflineRegionError(
              type: .other,
              message: "Offline region download timed out after \(timeoutDuration) seconds",
              isFatal: true,
              retryAfter: nil
          )
          
          region.setOfflineRegionDownloadStateFor(.inactive)
          self.offlinePackDidReceiveError(name: timeoutName, error: timeoutError)
      }
      
    let observer = OfflineRegionExampleObserver(
      name: name,
      statusChanged: { [weak self] (status) in
        guard let self = self else { return }
        timeoutHandler.reset()
        
        let sentences = [
          "Downloaded \(status.completedResourceCount)/\(status.requiredResourceCount) resources and \(status.completedResourceSize) bytes.",
          "Required resource count is \(status.requiredResourceCountIsPrecise ? "precise" : "a lower bound").",
          "Download state is \(status.downloadState == .active ? "active" : "inactive").",
        ]
        print(sentences.joined(separator: " "))

        if status.completedResourceCount == status.requiredResourceCount {
          if status.requiredResourceCountIsPrecise {
            print("Download complete with \(status.completedResourceCount) completed.")
          }else{
            print("Download complete but count was not precise.")
          }
          timeoutHandler.cancel()
          region.setOfflineRegionDownloadStateFor(.inactive)
          self.offlinePackProgressDidChange(name: name, status: status, state: .complete)
        } else if status.downloadState == .active {
          self.offlinePackProgressDidChange(name: name, status: status, state: .active)
        }
        else if status.downloadState == .inactive {
            timeoutHandler.cancel()
          if status.completedResourceCount == status.requiredResourceCount {
            if status.requiredResourceCountIsPrecise {
                print("Download complete with \(status.completedResourceCount) completed.")
            }else{
                print("Download complete but count was not precise.")
            }
            self.offlinePackProgressDidChange(name: name, status: status, state: .complete)
          } else {
            print("Download complete. Some resources failed to download. Resources that did download will be available offline.")
            timeoutHandler.cancel()
            let error = OfflineRegionError(type: OfflineRegionErrorType.other, message: "Some resources failed to download. Resources that did download will be available offline.", isFatal: true, retryAfter: nil)
            self.offlinePackProgressDidChange(name: name, status: status, state: .incomplete)
          }
        }
      },
      errorOccurred: { [weak self] (name, error) in
        guard let self = self else { return }
        if(error.isFatal){
          timeoutHandler.cancel()
        }else{
          timeoutHandler.reset()
        }
        self.offlinePackDidReceiveError(name: name, error: error)
      },
      maxTilesExceeded: { [weak self] (name, limit) in
        guard let self = self else { return }
        timeoutHandler.cancel()
        let error = OfflineRegionError(type: OfflineRegionErrorType.tileCountLimitExceeded, message: "Mapbox tile count max (\(limit)) has been exceeded!", isFatal: true, retryAfter: nil)
        self.offlinePackDidReceiveError(name: name, error: error)
      }
    )

    timeoutHandler.start()
      
    offlineRegion = region
    offlineRegion.setOfflineRegionObserverFor(observer)
    offlineRegion.setOfflineRegionDownloadStateFor(.active)
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
            // Determine state based on status
            let state: State = status.downloadState == .active ? .active :
                             status.completedResourceCount == status.requiredResourceCount ? .complete : .inactive

            // Get metadata from region
            var metadata: [String: Any]? = nil
            do {
              let byteMetadata = region.getMetadata()
              if let metadataString = NSKeyedUnarchiver.unarchiveObject(with: byteMetadata) as? String,
                 let data = metadataString.data(using: .utf8) {
                metadata = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
              }
            } catch {
              print("Failed to get metadata: \(error)")
            }

            resolver(self._makeRegionStatusPayload(name, status: status, state: state, metadata: metadata))

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

          self.startLoading(for: region, name: name)
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

  @objc
  func setTileCountLimit(_ limit: NSNumber) {
      DispatchQueue.main.async {
          print("setTileCountLimit started");
          self.offlineRegionManager.setOfflineMapboxTileCountLimitForLimit(limit.uint64Value)
          print("setTileCountLimit done: \(limit.uint64Value)");
      }
  }

  @objc
  func setTimeout(_ seconds: NSNumber) {
    print("setTimeout \(seconds)");
    self.defaultTimeoutDuration = seconds.doubleValue
  }
  
  func _sendEvent(_ name:String, event: RNMBXEvent) {
    if !hasListeners {
      return
    }
    self.sendEvent(withName: name, body: event.toJSON())
  }

  func _makeRegionStatusPayload(_ name:String, status: OfflineRegionStatus, state: State, metadata:[String:Any]?) -> [String:Any?] {
    let progressPercentage = status.requiredResourceCount > 0 ? Double(status.completedResourceCount) / Double(status.requiredResourceCount) : 0
    let percentage = min(ceil(Double(progressPercentage) * 100.0), 100.0)

    var result: [String:Any?] = [
      "state": state.rawValue,
      "name": name,
      "percentage": percentage,
      "completedResourceCount": status.completedResourceCount,
      "completedResourceSize": status.completedResourceSize,
      "completedTileSize": status.completedTileSize,
      "completedTileCount": status.completedTileCount,
      "requiredResourceCount": status.requiredResourceCount
    ]

    if let metadata = metadata {
      result["metadata"] = metadata
    }

    return result
  }

  func offlinePackProgressDidChange(name: String, status: OfflineRegionStatus, state: State) {
    if shouldSendProgressEvent(state: state) {
      let event = RNMBXEvent(type: .offlineProgress, payload: self._makeRegionStatusPayload(name, status: status, state: state, metadata: nil))
      self._sendEvent(Callbacks.progress.rawValue, event: event)
    }
  }

  func offlinePackDidReceiveError(name: String, error: OfflineRegionError) {
    let event = RNMBXEvent(type: .offlineError, payload: ["name": name, "message": error.message, "type": error.type.rawValue, "fatal": error.isFatal ])
    self._sendEvent(Callbacks.error.rawValue, event: event)
  }

  @objc
  func setProgressEventThrottle(_ throttleValue: NSNumber) {
    progressEventThrottle.waitBetweenEvents = throttleValue.doubleValue
  }

  func shouldSendProgressEvent(state: State) -> Bool {
    let currentTimestamp: Double = CACurrentMediaTime() * 1000.0

    guard let lastSentState = progressEventThrottle.lastSentState, lastSentState == state else {
      progressEventThrottle.lastSentState = state
      progressEventThrottle.lastSentTimestamp = currentTimestamp
      return true
    }

    guard let waitBetweenEvents = progressEventThrottle.waitBetweenEvents,
          let lastSentTimestamp = progressEventThrottle.lastSentTimestamp else {
      progressEventThrottle.lastSentTimestamp = currentTimestamp
      return true
    }

    if (currentTimestamp - lastSentTimestamp > waitBetweenEvents) {
      progressEventThrottle.lastSentTimestamp = currentTimestamp
      return true
    }

    return false
  }
}

/// Delegate for OfflineRegion
@available(*, deprecated)
final class OfflineRegionExampleObserver: OfflineRegionObserver {
    private let statusChanged: (OfflineRegionStatus) -> Void
    private let errorOccurred: (String, OfflineRegionError) -> Void
    private let maxTilesExceeded: (String, UInt64) -> Void
    private let name: String

    init(name: String,
         statusChanged: @escaping (OfflineRegionStatus) -> Void,
         errorOccurred: @escaping (String, OfflineRegionError) -> Void,
         maxTilesExceeded: @escaping (String, UInt64) -> Void) {
        self.name = name
        self.statusChanged = statusChanged
        self.errorOccurred = errorOccurred
        self.maxTilesExceeded = maxTilesExceeded
    }

    func statusChanged(for status: OfflineRegionStatus) {
        statusChanged(status)
    }

    func errorOccurred(forError error: OfflineRegionError) {
        // Only increment error count for non-fatal errors
        if !error.isFatal {
            print("Offline resource download error: \(error.type), \(error.message)")
        } else {
            print("Offline resource download fatal error: The region cannot proceed downloading of any resources and it will be put to inactive state. \(error.type), \(error.message)")
        }

        errorOccurred(name, error)
    }

    func mapboxTileCountLimitExceeded(forLimit limit: UInt64) {
        print("Mapbox tile count max (\(limit)) has been exceeded!")
        maxTilesExceeded(name, limit)
    }
}
