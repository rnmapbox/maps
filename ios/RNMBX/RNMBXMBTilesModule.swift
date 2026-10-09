import Foundation
import MapboxMaps

@objc(RNMBXMBTiles)
class RNMBXMBTilesModule: NSObject {

    private var activeSources: [String: MBTilesSource] = [:]

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    /**
     * Initialize and activate an MBTiles source from a file path
     */
    @objc
    func initMBTilesSource(
        _ filePath: String, sourceId: String, resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        // Handle file URL paths if provided
        var resolvedPath = filePath
        
        // Remove file:// prefix
        if resolvedPath.starts(with: "file://") {
            resolvedPath = resolvedPath.replacingOccurrences(of: "file://", with: "")
        }
        
        // Decode URL encoding (e.g., %20 -> space)
        if let decodedPath = resolvedPath.removingPercentEncoding {
            resolvedPath = decodedPath
        }
        
        RNMBXLogInfo("MBTiles: Attempting to load from path: \(resolvedPath)")

        // Check if file exists
        let fileManager = FileManager.default
        guard fileManager.fileExists(atPath: resolvedPath) else {
            rejecter("FILE_NOT_FOUND", "MBTiles file not found at path: \(resolvedPath)", nil)
            return
        }

        do {
            // Create and activate the MBTiles source
            let mbSource = try MBTilesSource(
                filePath: resolvedPath, sourceId: sourceId.isEmpty ? nil : sourceId)
            mbSource.activate()
            activeSources[mbSource.id] = mbSource

            // Return source information
            let resultDict: [String: Any] = [
                "id": mbSource.id,
                "url": mbSource.url,
                "isVector": mbSource.isVector,
                "format": mbSource.format,
                "minZoom": mbSource.minZoom as Any,
                "maxZoom": mbSource.maxZoom as Any,
            ]

            resolver(resultDict)
        } catch MBTilesSourceError.couldNotReadFile {
            rejecter("ERROR_READING_FILE", "Could not read the MBTiles file", nil)
        } catch MBTilesSourceError.unsupportedFormat {
            rejecter("UNSUPPORTED_FORMAT", "MBTiles format is not supported", nil)
        } catch {
            rejecter(
                "UNKNOWN_ERROR", "Error initializing MBTiles source: \(error.localizedDescription)",
                nil)
        }
    }

    /**
     * Initialize an MBTiles source from an asset in the app bundle
     */
    @objc
    func initMBTilesSourceFromAsset(
        _ assetName: String, sourceId: String, resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        do {
            // Copy from asset to local file
            let filePath = try MBTilesSource.readAsset(name: assetName)

            // Create and activate the MBTiles source
            let mbSource = try MBTilesSource(
                filePath: filePath, sourceId: sourceId.isEmpty ? nil : sourceId)
            mbSource.activate()
            activeSources[mbSource.id] = mbSource

            // Return source information
            let resultDict: [String: Any] = [
                "id": mbSource.id,
                "url": mbSource.url,
                "isVector": mbSource.isVector,
                "format": mbSource.format,
                "minZoom": mbSource.minZoom as Any,
                "maxZoom": mbSource.maxZoom as Any,
            ]

            resolver(resultDict)
        } catch MBTilesSourceError.couldNotReadFile {
            rejecter("ERROR_READING_FILE", "Could not read the MBTiles asset", nil)
        } catch MBTilesSourceError.unsupportedFormat {
            rejecter("UNSUPPORTED_FORMAT", "MBTiles format is not supported", nil)
        } catch {
            rejecter(
                "UNKNOWN_ERROR",
                "Error initializing MBTiles source from asset: \(error.localizedDescription)", nil)
        }
    }

    /**
     * Initialize an MBTiles source from a remote URL (downloads first)
     */
    @objc
    func initMBTilesSourceFromURL(
        _ urlString: String, sourceId: String, resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        guard let url = URL(string: urlString) else {
            rejecter("INVALID_URL", "Invalid URL: \(urlString)", nil)
            return
        }

        // Generate a filename from the URL or sourceId
        let fileName = sourceId.isEmpty
            ? url.lastPathComponent
            : "\(sourceId).mbtiles"

        // Get the destination path in the documents directory
        let documentsDirectory = NSSearchPathForDirectoriesInDomains(
            .documentDirectory, .userDomainMask, true)[0]
        let destinationPath = "\(documentsDirectory)/\(fileName)"

        // Download the file
        let task = URLSession.shared.downloadTask(with: url) { [weak self] tempURL, response, error in
            guard let self = self else { return }

            if let error = error {
                rejecter("DOWNLOAD_ERROR", "Failed to download MBTiles file: \(error.localizedDescription)", nil)
                return
            }

            guard let tempURL = tempURL else {
                rejecter("DOWNLOAD_ERROR", "No data received from URL", nil)
                return
            }

            do {
                // Remove existing file if it exists
                let fileManager = FileManager.default
                if fileManager.fileExists(atPath: destinationPath) {
                    try fileManager.removeItem(atPath: destinationPath)
                }

                // Move the downloaded file to the destination
                try fileManager.moveItem(at: tempURL, to: URL(fileURLWithPath: destinationPath))

                // Create and activate the MBTiles source
                let mbSource = try MBTilesSource(
                    filePath: destinationPath, sourceId: sourceId.isEmpty ? nil : sourceId)
                mbSource.activate()
                self.activeSources[mbSource.id] = mbSource

                // Return source information
                let resultDict: [String: Any] = [
                    "id": mbSource.id,
                    "url": mbSource.url,
                    "isVector": mbSource.isVector,
                    "format": mbSource.format,
                    "minZoom": mbSource.minZoom as Any,
                    "maxZoom": mbSource.maxZoom as Any,
                ]

                resolver(resultDict)
            } catch MBTilesSourceError.couldNotReadFile {
                rejecter("ERROR_READING_FILE", "Could not read the downloaded MBTiles file", nil)
            } catch MBTilesSourceError.unsupportedFormat {
                rejecter("UNSUPPORTED_FORMAT", "MBTiles format is not supported", nil)
            } catch {
                rejecter(
                    "UNKNOWN_ERROR",
                    "Error initializing MBTiles source from URL: \(error.localizedDescription)", nil)
            }
        }

        task.resume()
    }

    /**
     * Get the HTTP URL for an active MBTiles source to use in style json
     */
    @objc
    func getMBTilesURL(
        _ sourceId: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock
    ) {
        if let mbSource = activeSources[sourceId] {
            resolver(mbSource.url)
        } else {
            rejecter("SOURCE_NOT_FOUND", "MBTiles source with ID '\(sourceId)' is not active", nil)
        }
    }

    /**
     * Stop and remove an MBTiles source
     */
    @objc
    func removeMBTilesSource(
        _ sourceId: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock
    ) {
        if let mbSource = activeSources[sourceId] {
            mbSource.deactivate()
            activeSources.removeValue(forKey: sourceId)
            resolver(true)
        } else {
            resolver(false)
        }
    }

    /**
     * Check if an MBTiles source is currently active
     */
    @objc
    func isMBTilesSourceActive(
        _ sourceId: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock
    ) {
        resolver(activeSources[sourceId] != nil)
    }

    /**
     * List all active MBTiles sources
     */
    @objc
    func getActiveMBTilesSources(
        _ resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock
    ) {
        let sourceIds = Array(activeSources.keys)
        resolver(sourceIds)
    }

    /**
     * Manually start the MBTiles server
     */
    @objc
    func startServer(_ resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        MBTilesServer.shared.start()
        resolver(MBTilesServer.shared.isRunning)
    }

    /**
     * Manually stop the MBTiles server
     */
    @objc
    func stopServer(_ resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        MBTilesServer.shared.stop()
        resolver(true)
    }

    /**
     * Check if the MBTiles server is running
     */
    @objc
    func isServerRunning(_ resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        resolver(MBTilesServer.shared.isRunning)
    }
}
