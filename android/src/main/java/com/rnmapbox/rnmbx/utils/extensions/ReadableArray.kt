package com.rnmapbox.rnmbx.utils.extensions

import android.graphics.RectF
import com.facebook.react.bridge.ReadableArray
import com.mapbox.geojson.Point
import com.mapbox.maps.ScreenCoordinate
import com.rnmapbox.rnmbx.utils.Logger
import java.lang.Float.min
import java.lang.Float.max

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

fun ReadableArray.toRectF() : RectF? {
    if (size() != 4) {
        return null;
    }
    return RectF(
        min(getDouble(3).toFloat(), getDouble(1).toFloat()),
        min(getDouble(0).toFloat(), getDouble(2).toFloat()),
        max(getDouble(3).toFloat(), getDouble(1).toFloat()),
        max(getDouble(0).toFloat(), getDouble(2).toFloat())
    )
}
