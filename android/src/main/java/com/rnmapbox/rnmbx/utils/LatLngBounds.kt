package com.rnmapbox.rnmbx.utils

import com.mapbox.geojson.Point
import com.mapbox.maps.CoordinateBounds

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

    fun toCameraBounds(): CoordinateBounds {
        if (latNorth != latSouth) {
            return toBounds()
        }

        // Mapbox returns zoom 0 when fitting zero-height bounds (#4050).
        // Expand only the fitting bounds, preserving the center and exact camera constraints.
        val latitudePadding = 0.000001
        return CoordinateBounds(
            Point.fromLngLat(lonWest, (latSouth - latitudePadding).coerceAtLeast(-90.0)),
            Point.fromLngLat(lonEast, (latNorth + latitudePadding).coerceAtMost(90.0)),
            false
        )
    }

    companion object {
        fun from(bbox: Double, bbox1: Double, bbox2: Double, bbox3: Double): LatLngBounds {
            return LatLngBounds(bbox, bbox1, bbox2, bbox3)
        }
    }
}
