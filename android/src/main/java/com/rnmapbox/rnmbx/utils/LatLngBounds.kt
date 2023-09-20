package com.rnmapbox.rnmbx.utils

import com.mapbox.geojson.Point
import com.mapbox.maps.CoordinateBounds
import com.rnmapbox.rnmbx.utils.LatLngBounds

class LatLngBounds internal constructor(
    var latNorth: Double,
    var lonEast: Double,
    var latSouth: Double,
    var lonWest: Double
) {
    val southWest: LatLng
        get() = LatLng(latSouth, lonWest)
    val northEast: LatLng
        get() = LatLng(latNorth, lonEast)

    fun toLatLngs(): Array<LatLng> {
        return arrayOf(northEast, southWest)
    }

    fun toBounds(): CoordinateBounds {
        return CoordinateBounds(
            Point.fromLngLat(lonWest, latSouth),
            Point.fromLngLat(lonEast, latNorth),
            false
        )
    }

    companion object {
        fun from(bbox: Double, bbox1: Double, bbox2: Double, bbox3: Double): LatLngBounds {
            return LatLngBounds(bbox, bbox1, bbox2, bbox3)
        }
    }
}