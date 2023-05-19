package com.mapbox.rctmgl.utils.extensions

import com.facebook.react.bridge.ReadableArray
import com.mapbox.geojson.Point
import com.mapbox.maps.ScreenCoordinate
import com.mapbox.rctmgl.utils.Logger

fun ReadableArray.toCoordinate() : Point {
    if (this.size() != 2) {
        Logger.e("ReadableArray.toCoordinate","Cannot convert $this to point, 2 coordinates are required")
    }
    return Point.fromLngLat(
        getDouble(0),
        getDouble(1)
    )
}

fun ReadableArray.toScreenCoordinate() : ScreenCoordinate {
    if (this.size() != 2) {
        Logger.e("ReadableArray.toCoordinate","Cannot convert $this to point, 2 coordinates are required")
    }
    return ScreenCoordinate(getDouble(0), getDouble(1))
}
