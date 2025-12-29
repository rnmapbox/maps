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
    func initMBTilesSource(_ filePath: String, sourceId: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        // Handle file URL paths if provided
        var resolvedPath = filePath
        if filePath.starts(with: "file://") {
            resolvedPath = filePath.replacingOccurrences(of: "file://", with: "")
        }

        // Check if file exists
        let fileManager = FileManager.default
        guard fileManager.fileExists(atPath: resolvedPath) else {
            rejecter("FILE_NOT_FOUND", "MBTiles file not found at path: \(resolvedPath)", nil)
            return
        }

        do {
            // Create and activate the MBTiles source
            let mbSource = try MBTilesSource(filePath: resolvedPath, sourceId: sourceId.isEmpty ? nil : sourceId)
            mbSource.activate()
            activeSources[mbSource.id] = mbSource

            // Return source information
            let resultDict: [String: Any] = [
                "id": mbSource.id,
                "url": mbSource.url,
                "isVector": mbSource.isVector,
                "format": mbSource.format,
                "minZoom": mbSource.minZoom as Any,
                "maxZoom": mbSource.maxZoom as Any
            ]

            resolver(resultDict)
        } catch MBTilesSourceError.couldNotReadFile {
            rejecter("ERROR_READING_FILE", "Could not read the MBTiles file", nil)
        } catch MBTilesSourceError.unsupportedFormat {
            rejecter("UNSUPPORTED_FORMAT", "MBTiles format is not supported", nil)
        } catch {
            rejecter("UNKNOWN_ERROR", "Error initializing MBTiles source: \(error.localizedDescription)", nil)
        }
    }

    /**
     * Initialize an MBTiles source from an asset in the app bundle
     */
    @objc
    func initMBTilesSourceFromAsset(_ assetName: String, sourceId: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        do {
            // Copy from asset to local file
            let filePath = try MBTilesSource.readAsset(name: assetName)

            // Create and activate the MBTiles source
            let mbSource = try MBTilesSource(filePath: filePath, sourceId: sourceId.isEmpty ? nil : sourceId)
            mbSource.activate()
            activeSources[mbSource.id] = mbSource

            // Return source information
            let resultDict: [String: Any] = [
                "id": mbSource.id,
                "url": mbSource.url,
                "isVector": mbSource.isVector,
                "format": mbSource.format,
                "minZoom": mbSource.minZoom as Any,
                "maxZoom": mbSource.maxZoom as Any
            ]

            resolver(resultDict)
        } catch MBTilesSourceError.couldNotReadFile {
            rejecter("ERROR_READING_FILE", "Could not read the MBTiles asset", nil)
        } catch MBTilesSourceError.unsupportedFormat {
            rejecter("UNSUPPORTED_FORMAT", "MBTiles format is not supported", nil)
        } catch {
            rejecter("UNKNOWN_ERROR", "Error initializing MBTiles source from asset: \(error.localizedDescription)", nil)
        }
    }

    /**
     * Get the HTTP URL for an active MBTiles source to use in style json
     */
    @objc
    func getMBTilesURL(_ sourceId: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
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
    func removeMBTilesSource(_ sourceId: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
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
    func isMBTilesSourceActive(_ sourceId: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        resolver(activeSources[sourceId] != nil)
    }

    /**
     * List all active MBTiles sources
     */
    @objc
    func getActiveMBTilesSources(_ resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        let sourceIds = Array(activeSources.keys)
        resolver(sourceIds)
    }
}