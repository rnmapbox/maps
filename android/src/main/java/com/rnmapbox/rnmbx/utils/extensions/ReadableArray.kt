package com.rnmapbox.rnmbx.utils.extensions

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableType
import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.mapbox.geojson.Point
import com.mapbox.maps.ScreenBox
import com.mapbox.maps.ScreenCoordinate
import com.rnmapbox.rnmbx.utils.Logger
import kotlin.math.max
import kotlin.math.min

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
        Logger.e("ReadableArray.toScreenCoordinate","Cannot convert $this to point, 2 coordinates are required")
    }
    return ScreenCoordinate(getDouble(0), getDouble(1))
}

fun ReadableArray.toScreenBox() : ScreenBox {
    if (this.size() != 4) {
        Logger.e("ReadableArray.toScreenBox","Cannot convert $this to box, 4 coordinates are required")
    }

    val top = getDouble(0)
    val left = getDouble(1)
    val bottom = getDouble(2)
    val right = getDouble(3)

    return ScreenBox(
        ScreenCoordinate(min(left, right), min(top, bottom)),
        ScreenCoordinate(max(left, right), max(top, bottom))
    )
}

fun ReadableArray.toJsonArray() : JsonArray {
    val result = JsonArray(size())
    for (i in 0 until size()) {
        when (getType(i)) {
            ReadableType.Map -> getMap(i)?.let { result.add(it.toJsonObject()) } ?: Logger.d("ReadableTypeMap", "Map at index $i is null")
            ReadableType.Array -> getArray(i)?.let {result.add(it.toJsonArray())} ?: Logger.d("ReadableTypeArray", "Array at index $i is null")
            ReadableType.Null -> result.add(null as JsonElement?)
            ReadableType.Number -> result.add(getDouble(i))
            ReadableType.String -> result.add(getString(i))
            ReadableType.Boolean -> result.add(getBoolean(i))
        }
    }
    return result
}
