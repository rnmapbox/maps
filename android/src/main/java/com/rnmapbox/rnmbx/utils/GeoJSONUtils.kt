package com.rnmapbox.rnmbx.utils

import android.location.Location
import android.location.LocationManager
import com.facebook.react.bridge.*
import com.rnmapbox.rnmbx.utils.GeoJSONUtils
import com.mapbox.geojson.*
import com.mapbox.maps.CoordinateBounds
import com.mapbox.maps.CameraBounds
import com.rnmapbox.rnmbx.utils.LatLngBounds
import com.mapbox.turf.TurfMeasurement
import com.rnmapbox.rnmbx.utils.LatLngQuad
import com.rnmapbox.rnmbx.utils.extensions.toReadableArray
import java.util.ArrayList



object GeoJSONUtils {
    @JvmStatic
    fun fromFeature(feature: Feature): WritableMap {
        val map = Arguments.createMap()
        map.putString("type", "Feature")
        map.putString("id", feature.id())
        feature.geometry()?.also {
            val geometry = fromGeometry(it)
            map.putMap("geometry", geometry)
        } ?: run {
            Logger.w(
                LOG_TAG,
                "GeoJSONUtils.fromFeature geometry was null for feature: ${feature.toJson()}"
            )
        }
        val properties = ConvertUtils.toWritableMap(feature.properties())
        map.putMap("properties", properties)
        return map
    }

    fun fromGeometry(geometry: Geometry): WritableMap? {
        val type = geometry.type()
        val coordinates : WritableArray = when (type) {
            "Point" -> coordinates(geometry as Point)
            "LineString" -> coordinatesL((geometry as LineString).coordinates())
            "Polygon" -> coordinatesLL((geometry as Polygon).coordinates())
            "MultiLineString" -> coordinatesLL((geometry as MultiLineString).coordinates())
            "MultiPolygon" -> coordinatesLLL((geometry as MultiPolygon).coordinates())
            "GeometryCollection" -> {
                return multiGeometry(type,
                    Arguments.fromList((geometry as GeometryCollection).geometries().map {
                        fromGeometry(it)
                    })
                )
            }
            else -> {
                Logger.w(LOG_TAG, "GeoJSONUtils.fromGeometry unsupported type:$type")
                return null
            }
        }
        return geometry(type, coordinates);
    }

    private fun multiGeometry(type: String, geometries: WritableArray):WritableMap {
        val map = Arguments.createMap();
        map.putString("type", type);
        map.putArray("geometries", geometries);
        return map
    }
    private fun geometry(type: String, coordinates: WritableArray):WritableMap {
        val map = Arguments.createMap();
        map.putString("type", type);
        map.putArray("coordinates", coordinates);
        return map
    }

    private fun coordinates(point: Point): WritableArray {
        return Arguments.fromArray(pointToDoubleArray(point))
    }

    private fun fromList(items: List<ReadableArray>): WritableArray {
        val ret = WritableNativeArray();
        items.forEach {
            ret.pushArray(it)
        }
        return ret;
    }

    private fun coordinatesL(points: List<Point>): WritableArray {
        return fromList(points.map { it.toReadableArray() })
    }

    private fun coordinatesLL(points: List<List<Point>>): WritableArray {
        return fromList(points.map { coordinatesL(it) })
    }

    private fun coordinatesLLL(points: List<List<List<Point>>>): WritableArray {
        return fromList(points.map { coordinatesLL(it) })
    }

    @JvmStatic
    fun toPointFeature(latLng: LatLng, properties: WritableMap?): WritableMap {
        val map: WritableMap = WritableNativeMap()
        map.putString("type", "Feature")
        map.putMap("geometry", toPointGeometry(latLng))
        properties?.let {
            if (it.hasKey("id") == true) {
                map.putString("id", it.getString("id"));
            }
        }
        map.putMap("properties", properties)
        return map
    }

    @JvmStatic
    fun toGNPointGeometry(latLng: LatLng): Point? {
        return Point.fromLngLat(latLng.getLongitude(), latLng.getLatitude())
    }

    fun toPointGeometry(latLng: LatLng): WritableMap {
        val geometry: WritableMap = WritableNativeMap()
        geometry.putString("type", "Point")
        geometry.putArray("coordinates", fromLatLng(latLng))
        return geometry
    }

    fun fromLatLng(latLng: LatLng): WritableArray {
        val coords = doubleArrayOf(latLng.getLongitude(), latLng.getLatitude())
        val writableCoords: WritableArray = WritableNativeArray()
        writableCoords.pushDouble(coords[0])
        writableCoords.pushDouble(coords[1])
        return writableCoords
    }

    fun toLatLng(point: Point): LatLng {
        return LatLng(point.latitude(), point.longitude())
    }

    fun toLatLng(coordinates: ReadableArray?): LatLng? {
        return if (coordinates == null || coordinates.size() < 2) {
            null
        } else LatLng(coordinates.getDouble(1), coordinates.getDouble(0))
    }

    @JvmStatic
    fun toPointGeometry(featureJSONString: String?): Point? {
        val feature = Feature.fromJson(featureJSONString!!) ?: return null
        return feature.geometry() as Point?
    }

    fun fromCoordinateBounds(bounds: CoordinateBounds): WritableArray {
        val array = Arguments.createArray()
        val ne = bounds.northeast
        val sw = bounds.southwest

        array.pushArray(fromLatLng(LatLng(ne.latitude(), ne.longitude())));
        array.pushArray(fromLatLng(LatLng(sw.latitude(), sw.longitude())));
        return array
    }

    fun fromCameraBounds(bounds: CameraBounds): WritableArray {
        return fromCoordinateBounds(bounds.bounds)
    }

    fun fromLatLngBounds(latLngBounds: LatLngBounds): WritableArray {
        val array = Arguments.createArray()
        val latLngs = latLngBounds.toLatLngs()
        for (latLng in latLngs) {
            array.pushArray(fromLatLng(latLng))
        }
        return array
    }

    fun fromLatLngBoundsToPolygon(latLngBounds: LatLngBounds): Polygon {
        val contours = ArrayList<List<Point>>()
        val contour = ArrayList<Point>()
        contour.add(Point.fromLngLat(latLngBounds.lonEast, latLngBounds.latNorth))
        contour.add(Point.fromLngLat(latLngBounds.lonEast, latLngBounds.latSouth))
        contour.add(Point.fromLngLat(latLngBounds.lonWest, latLngBounds.latSouth))
        contour.add(Point.fromLngLat(latLngBounds.lonWest, latLngBounds.latNorth))
        contour.add(Point.fromLngLat(latLngBounds.lonEast, latLngBounds.latNorth))
        contours.add(contour)
        return Polygon.fromLngLats(contours)
    }

    private fun toGeometryCollection(features: List<Feature>?): GeometryCollection {
        val geometries = ArrayList<Geometry?>()
        geometries.ensureCapacity(features!!.size)
        for (feature in features) {
            geometries.add(feature.geometry())
        }
        return GeometryCollection.fromGeometries(geometries)
    }

    @JvmStatic
    fun toLatLngBounds(featureCollection: FeatureCollection): LatLngBounds {
        val features = featureCollection.features()
        val bbox = TurfMeasurement.bbox(toGeometryCollection(features))
        return LatLngBounds.from(bbox[3], bbox[2], bbox[1], bbox[0])
    }

    @JvmStatic
    fun toLatLngQuad(array: ReadableArray?): LatLngQuad? {
        // [top left, top right, bottom right, bottom left]
        return if (array == null || array.size() < 4) {
            null
        } else LatLngQuad(
            toLatLng(array.getArray(0)),
            toLatLng(array.getArray(1)),
            toLatLng(array.getArray(2)),
            toLatLng(array.getArray(3))
        )
    }

    fun pointToDoubleArray(point: Point?): DoubleArray {
        return if (point == null) {
            doubleArrayOf(0.0, 0.0)
        } else doubleArrayOf(point.longitude(), point.latitude())
    }

    @JvmStatic
    fun toPoint(location: Location): Point {
        return Point.fromLngLat(location.longitude, location.latitude)
    }

    @JvmStatic
    fun toLocation(point: Point): Location {
        val result = Location(LocationManager.GPS_PROVIDER)
        result.latitude = point.latitude()
        result.longitude = point.longitude()
        if (point.hasAltitude()) {
            result.altitude = point.altitude()
        }
        return result
    }

    const val LOG_TAG = "GeoJSONUtils"
}