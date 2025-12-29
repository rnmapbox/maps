import Foundation
import MapboxMaps
import Network
import SQLite3

// MARK: - Shared Protocol
public protocol MBTileProvider {
    var isVector: Bool { get }
    func getTile(z: Int, x: Int, y: Int) -> Data?
}

// MARK: - Error Types
public enum MBTilesSourceError: Error {
    case couldNotReadFile
    case unsupportedFormat
    case databaseError(message: String)
}

// MARK: - MBTilesServer
public class MBTilesServer {
    public static let shared = MBTilesServer()

    public let port: UInt16 = 8888
    private var listener: NWListener?
    public var sources: [String: MBTileProvider] = [:]

    public var isRunning: Bool {
        return listener != nil
    }

    private init() {
        // Initialize the server
    }

    public func start() {
        guard listener == nil else {
            return
        }

        do {
            // Create a listener on the local loopback interface
            let port = NWEndpoint.Port(integerLiteral: self.port)
            listener = try NWListener(using: .tcp, on: port)

            listener?.stateUpdateHandler = { [weak self] state in
                switch state {
                case .ready:
                    RNMBXLogInfo("MBTiles server started on port \(self?.port ?? 0)")
                case .failed(let error):
                    RNMBXLogError("MBTiles server failed: \(error.localizedDescription)")
                default:
                    break
                }
            }

            listener?.newConnectionHandler = { [weak self] connection in
                self?.handleConnection(connection)
            }

            listener?.start(queue: .main)
        } catch {
            RNMBXLogError("Error starting MBTiles server: \(error.localizedDescription)")
        }
    }

    public func stop() {
        listener?.cancel()
        listener = nil
        RNMBXLogInfo("MBTiles server stopped")
    }

    private func handleConnection(_ connection: NWConnection) {
        connection.stateUpdateHandler = { state in
            switch state {
            case .ready:
                // Ready to receive data
                self.receiveRequest(on: connection)
            case .failed(let error):
                RNMBXLogError("Connection failed: \(error.localizedDescription)")
                connection.cancel()
            case .cancelled:
                break
            default:
                break
            }
        }

        connection.start(queue: .main)
    }

    private func receiveRequest(on connection: NWConnection) {
        connection.receive(minimumIncompleteLength: 1, maximumLength: 65536) { [weak self] data, _, isComplete, error in
            guard let self = self, let data = data, !data.isEmpty, error == nil else {
                connection.cancel()
                return
            }

            if let requestString = String(data: data, encoding: .utf8) {
                // Parse the HTTP request to extract the path
                // This is a simplified implementation - a real HTTP server would need more robust parsing
                if let requestLine = requestString.components(separatedBy: "\r\n").first,
                   let getRequestPath = requestLine.components(separatedBy: " ").dropFirst().first {

                    let path = getRequestPath

                    // Expecting path format: /{sourceId}/{z}/{x}/{y}.{format}
                    let pathComponents = path.split(separator: "/").map(String.init)

                    // Path should be like /mbtiles-source/0/0/0.pbf
                    // First component is empty (leading slash), second is sourceId
                    if pathComponents.count >= 4 {
                        // Use the first non-empty component as the sourceId
                        let sourceId = pathComponents[0].isEmpty ? pathComponents[1] : pathComponents[0]

                        if let source = self.sources[sourceId] {
                            // Determine the indices for z, x, y based on path component count and empty first component
                            let zIndex = pathComponents[0].isEmpty ? 2 : 1
                            let xIndex = pathComponents[0].isEmpty ? 3 : 2
                            let yIndex = pathComponents[0].isEmpty ? 4 : 3

                            // Make sure we have enough components
                            guard pathComponents.count > yIndex else {
                                self.sendErrorResponse(connection, statusCode: 400)
                                return
                            }

                            // Extract z, x, y from path
                            let zString = pathComponents[zIndex]
                            let xString = pathComponents[xIndex]

                            // Extract y and format from the last component (e.g., "10.pbf")
                            let lastComponent = pathComponents[yIndex]
                            let parts = lastComponent.split(separator: ".").map(String.init)

                            if parts.count == 2,
                               let z = Int(zString),
                               let x = Int(xString),
                               let y = Int(parts[0]) {

                                let format = parts[1]

                                // Convert y coordinate (TMS to XYZ)
                                let flippedY = (1 << z) - 1 - y

                                if let tileData = source.getTile(z: z, x: x, y: flippedY) {
                                    // Send the tile data as response
                                    let contentType = self.mimeTypeFor(format: format)
                                    var headers = "HTTP/1.1 200 OK\r\nContent-Type: \(contentType)\r\nContent-Length: \(tileData.count)\r\n"

                                    if source.isVector {
                                        headers += "Content-Encoding: gzip\r\n"
                                    }

                                    headers += "\r\n"

                                    if let headerData = headers.data(using: .utf8) {
                                        // Send headers
                                        connection.send(content: headerData, completion: .contentProcessed { error in
                                            if error == nil {
                                                // Send the tile data
                                                connection.send(content: tileData, completion: .contentProcessed { error in
                                                    connection.cancel()
                                                })
                                            } else {
                                                connection.cancel()
                                            }
                                        })
                                    } else {
                                        self.sendErrorResponse(connection, statusCode: 500)
                                    }
                                    return
                                } else {
                                    self.sendErrorResponse(connection, statusCode: 404)
                                    return
                                }
                            } else {
                                self.sendErrorResponse(connection, statusCode: 400)
                                return
                            }
                        } else {
                            self.sendErrorResponse(connection, statusCode: 404)
                            return
                        }
                    }

                    // If we reach here, request was invalid
                    self.sendErrorResponse(connection, statusCode: 404)
                } else {
                    self.sendErrorResponse(connection, statusCode: 400)
                }
            } else {
                self.sendErrorResponse(connection, statusCode: 400)
            }
        }
    }

    private func sendErrorResponse(_ connection: NWConnection, statusCode: Int) {
        var statusText = "Not Found"
        switch statusCode {
        case 400: statusText = "Bad Request"
        case 404: statusText = "Not Found"
        case 500: statusText = "Internal Server Error"
        default: break
        }

        let response = "HTTP/1.1 \(statusCode) \(statusText)\r\nContent-Length: 0\r\n\r\n"
        if let data = response.data(using: .utf8) {
            connection.send(content: data, completion: .contentProcessed { _ in
                connection.cancel()
            })
        } else {
            connection.cancel()
        }
    }

    private func mimeTypeFor(format: String) -> String {
        switch format.lowercased() {
        case "jpg", "jpeg":
            return "image/jpeg"
        case "png":
            return "image/png"
        case "pbf", "mvt":
            return "application/x-protobuf"
        default:
            return "application/octet-stream"
        }
    }
}

// MARK: - MBTilesSource
public class MBTilesSource: MBTileProvider {
    private let TAG = "MBTilesSource"

    public let id: String
    public let url: String
    private var db: OpaquePointer?

    public var isVector: Bool = false
    public var format: String = ""
    public var minZoom: Float?
    public var maxZoom: Float?

    // Lazy initialization of the source instance based on format
    public lazy var instance: Source = {
        if isVector {
            #if RNMBX_11
            var builder = VectorSource(id: id)
            #else
            var builder = VectorSource()
            #endif
            builder.tiles = [url]
            return builder
        } else {
            #if RNMBX_11
            var builder = RasterSource(id: id)
            #else
            var builder = RasterSource()
            #endif
            builder.tiles = [url]
            builder.tileSize = 256
            return builder
        }
    }()

    public init(filePath: String, sourceId: String? = nil) throws {
        // Set the source ID (use filename if not provided)
        self.id = sourceId ?? URL(fileURLWithPath: filePath).deletingPathExtension().lastPathComponent
        self.url = "http://localhost:\(MBTilesServer.shared.port)/\(id)/{z}/{x}/{y}.{format}"

        // Open the SQLite database
        if sqlite3_open(filePath, &db) != SQLITE_OK {
            RNMBXLogError("Failed to open MBTiles file: \(filePath)")
            throw MBTilesSourceError.couldNotReadFile
        }

        // Read the format from metadata
        try readFormat()

        // Read additional metadata
        readMetadata()
    }

    private func readFormat() throws {
        let query = "SELECT value FROM metadata WHERE name = 'format'"
        var statement: OpaquePointer?

        guard sqlite3_prepare_v2(db, query, -1, &statement, nil) == SQLITE_OK else {
            throw MBTilesSourceError.databaseError(message: "Failed to prepare statement for format query")
        }

        defer { sqlite3_finalize(statement) }

        guard sqlite3_step(statement) == SQLITE_ROW else {
            throw MBTilesSourceError.unsupportedFormat
        }

        if let formatCString = sqlite3_column_text(statement, 0) {
            format = String(cString: formatCString)

            // Determine if vector or raster based on format
            if MBTilesSource.validVectorFormats.contains(format) {
                isVector = true
            } else if MBTilesSource.validRasterFormats.contains(format) {
                isVector = false
            } else {
                throw MBTilesSourceError.unsupportedFormat
            }
        } else {
            throw MBTilesSourceError.unsupportedFormat
        }
    }

    private func readMetadata() {
        // Read minzoom
        if let value = getMetadataValue(name: "minzoom") {
            minZoom = Float(value)
        }

        // Read maxzoom
        if let value = getMetadataValue(name: "maxzoom") {
            maxZoom = Float(value)
        }
    }

    private func getMetadataValue(name: String) -> String? {
        let query = "SELECT value FROM metadata WHERE name = ?"
        var statement: OpaquePointer?

        guard sqlite3_prepare_v2(db, query, -1, &statement, nil) == SQLITE_OK else {
            return nil
        }

        defer { sqlite3_finalize(statement) }

        // Use cString to get proper C string and ensure it stays in memory
        let cName = name.cString(using: .utf8)
        sqlite3_bind_text(statement, 1, cName, -1, nil)

        if sqlite3_step(statement) == SQLITE_ROW, let valueCString = sqlite3_column_text(statement, 0) {
            return String(cString: valueCString)
        }

        return nil
    }

    public func getTile(z: Int, x: Int, y: Int) -> Data? {
        let query = "SELECT tile_data FROM tiles WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?"
        var statement: OpaquePointer?

        guard sqlite3_prepare_v2(db, query, -1, &statement, nil) == SQLITE_OK else {
            return nil
        }

        defer { sqlite3_finalize(statement) }

        sqlite3_bind_int(statement, 1, Int32(z))
        sqlite3_bind_int(statement, 2, Int32(x))
        sqlite3_bind_int(statement, 3, Int32(y))

        if sqlite3_step(statement) == SQLITE_ROW {
            let dataSize = Int(sqlite3_column_bytes(statement, 0))
            let dataPointer = sqlite3_column_blob(statement, 0)

            if let dataPointer = dataPointer, dataSize > 0 {
                return Data(bytes: dataPointer, count: dataSize)
            }
        }

        return nil
    }

    public func activate() {
        MBTilesServer.shared.sources[id] = self
        MBTilesServer.shared.start()
    }

    public func deactivate() {
        MBTilesServer.shared.sources.removeValue(forKey: id)
        if MBTilesServer.shared.sources.isEmpty {
            MBTilesServer.shared.stop()
        }
    }

    deinit {
        if let db = db {
            sqlite3_close(db)
        }
    }

    // Read an asset from the bundle
    public static func readAsset(name: String) throws -> String {
        guard let bundlePath = Bundle.main.path(forResource: name, ofType: nil) else {
            throw MBTilesSourceError.couldNotReadFile
        }

        // Create directory if needed
        let documentsDirectory = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0]
        let destinationPath = "\(documentsDirectory)/\(name)"

        // Copy file from bundle to documents directory
        do {
            try FileManager.default.copyItem(atPath: bundlePath, toPath: destinationPath)
            return destinationPath
        } catch {
            throw MBTilesSourceError.couldNotReadFile
        }
    }

    public static let validRasterFormats = ["jpg", "png"]
    public static let validVectorFormats = ["pbf", "mvt"]
}