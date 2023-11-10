package com.rnmapbox.rnmbx.utils.extensions

import android.graphics.RectF
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableType
import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.mapbox.geojson.Point
import com.mapbox.maps.ScreenCoordinate
import com.rnmapbox.rnmbx.utils.ConvertUtils
import com.rnmapbox.rnmbx.utils.Logger
import org.json.JSONArray
import java.lang.Float.max
import java.lang.Float.min

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

fun ReadableArray.toJsonArray() : JsonArray {
    val result = JsonArray(size())
    for (i in 0 until size()) {
        when (getType(i)) {
            ReadableType.Map -> result.add(getMap(i).toJsonObject())
            ReadableType.Array -> result.add(getArray(i).toJsonArray())
            ReadableType.Null -> result.add(null as JsonElement?)
            ReadableType.Number -> result.add(getDouble(i))
            ReadableType.String -> result.add(getString(i))
            ReadableType.Boolean -> result.add(getBoolean(i))
        }
    }
    return result
}
