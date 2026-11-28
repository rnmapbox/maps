import MapboxMaps

struct CustomHttpHeadersOptions {
  var urlRegexp: NSRegularExpression?
}

struct CustomHttpHeadersMapValue {
  var headerValue: String
  var options: CustomHttpHeadersOptions
}

final class CustomHttpHeaders {
  static let shared = CustomHttpHeaders()

  private final class Snapshot {
    let headers: [String: CustomHttpHeadersMapValue]

    init(_ headers: [String: CustomHttpHeadersMapValue]) {
      self.headers = headers
    }
  }

  // Written only from the native-module queue (one serial queue under both the bridge and TurboModules), so a write
  // publishes a new immutable snapshot without locking and readers on Mapbox's HTTP thread take no lock either.
  // Published snapshots are never released: a reader may still be using one it loaded before the next write.
  private let current = RNMBXAtomicPointer()
  private var published: [Snapshot] = []

  var customHeaders: [String: CustomHttpHeadersMapValue] {
    guard let pointer = current.loadAcquire() else { return [:] }
    return Unmanaged<Snapshot>.fromOpaque(pointer).takeUnretainedValue().headers
  }

  func addCustomHeader(_ name: String, value: CustomHttpHeadersMapValue) {
    var headers = customHeaders
    headers[name] = value
    publish(headers)
  }

  func removeCustomHeader(_ name: String) {
    var headers = customHeaders
    headers[name] = nil
    publish(headers)
  }

  private func publish(_ headers: [String: CustomHttpHeadersMapValue]) {
    let snapshot = Snapshot(headers)
    published.append(snapshot)
    current.storeRelease(Unmanaged.passUnretained(snapshot).toOpaque())
  }

  func getCustomRequestHeaders(for request: HttpRequest, with customHeaders: [String: CustomHttpHeadersMapValue]) -> [String: String] {
    var headers: [String: String] = [:]
    let urlString = request.url

    for (key, entry) in customHeaders {
      if let pattern = entry.options.urlRegexp {
        let range = NSRange(location: 0, length: urlString.utf16.count)
        if pattern.firstMatch(in: urlString, options: [], range: range) != nil {
          headers[key] = entry.headerValue
        }
      } else {
        headers[key] = entry.headerValue
      }
    }
    return headers
  }

  func apply(to request: HttpRequest) {
    let snapshot = customHeaders
    guard !snapshot.isEmpty else { return }
    request.headers.merge(getCustomRequestHeaders(for: request, with: snapshot)) { (_, new) in new }
  }
}
