import MapboxMaps

internal extension CoordinateBounds {
  func toArray() -> [[Double]] {
    return [
      northeast.toArray(),
      southwest.toArray()
    ]
  }
}
