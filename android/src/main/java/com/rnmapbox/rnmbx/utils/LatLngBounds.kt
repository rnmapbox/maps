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
        val latitudePadding = if (latNorth == latSouth) 0.000001 else 0.0
        val longitudePadding = if (lonWest == lonEast) 0.000001 else 0.0
        if (latitudePadding == 0.0 && longitudePadding == 0.0) {
            return toBounds()
        }

        // Mapbox can return zoom 0 when fitting degenerate bounds (#4050).
        // Expand only zero-size dimensions for fitting; constraints keep the exact original bounds.
        return CoordinateBounds(
            Point.fromLngLat(
                (lonWest - longitudePadding).coerceAtLeast(-180.0),
                (latSouth - latitudePadding).coerceAtLeast(-90.0)
            ),
            Point.fromLngLat(
                (lonEast + longitudePadding).coerceAtMost(180.0),
                (latNorth + latitudePadding).coerceAtMost(90.0)
            ),
            false
        )
    }

    companion object {
        fun from(bbox: Double, bbox1: Double, bbox2: Double, bbox3: Double): LatLngBounds {
            return LatLngBounds(bbox, bbox1, bbox2, bbox3)
        }
    }
}
