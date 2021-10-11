import MapboxMaps
import MapKit

class RCTMGLFeatureUtils {
  
  enum ParseError : Error {
    case fcParseError(String)
  }
  
  static func parseAsFC(string: String) throws -> GeoJSONObject {
    let data = string.data(using: .utf8)!
    let geojson = try JSONDecoder().decode(GeoJSONObject.self, from:data)
    return geojson
    //let feature = Feature(geometry: try JSONDecoder().decode(Geometry.self, from: data))
    // return feature
  }
  
  static func toNSValue(_ cglocation: CLLocationCoordinate2D) -> NSValue {
    return NSValue(mkCoordinate: cglocation)
//    return NSValue(cgPoint: CGPoint(x: cglocation.latitude, y: cglocation.longitude))
  }
  
  static func geometryToGeometry(_ geometry: Turf.Geometry) -> MapboxCommon.Geometry {
    switch geometry {
    case .geometryCollection(let collection):
      return MapboxCommon.Geometry(geometryCollection: collection.geometries.map { geometryToGeometry($0) })
    case .lineString(let lineString):
      return MapboxCommon.Geometry(line: lineString.coordinates.map { toNSValue($0) })
    case .multiLineString(let multiLineString):
      return MapboxCommon.Geometry(multiLine: multiLineString.coordinates.map { $0.map { toNSValue($0) }})
    case .multiPoint(let multiPoint):
      return MapboxCommon.Geometry(multiPoint: multiPoint.coordinates.map { toNSValue($0) })
    case .multiPolygon(let multiPolygon):
      return MapboxCommon.Geometry(multiPolygon: multiPolygon.coordinates.map { $0.map { $0.map { toNSValue($0) }}})
    case .point(let point):
      return MapboxCommon.Geometry(point: toNSValue(point.coordinates))
/*
      let value = NSValue(cgPoint: CGPoint(x: point.coordinates.longitude, y: point.coordinates.latitude))
      return MapboxCommon.Geometry(point: value) */
    case .polygon(let polygon):
      return MapboxCommon.Geometry(polygon: polygon.coordinates.map { $0.map { toNSValue($0)}})
    }
  }
  
  static func fcToGeomtry(_ collection: FeatureCollection) -> Turf.Geometry {
    return .geometryCollection(GeometryCollection(geometries: collection.features.map { $0.geometry! }))
  }

  static func boundingBox(geometry: Geometry) -> BoundingBox? {
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
  
}
