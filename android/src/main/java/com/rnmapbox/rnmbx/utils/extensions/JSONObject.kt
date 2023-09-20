package com.rnmapbox.rnmbx.utils.extensions

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.mapbox.bindgen.Value
import com.mapbox.geojson.Geometry
import com.mapbox.geojson.Polygon
import com.rnmapbox.rnmbx.utils.Logger
import org.json.JSONArray
import org.json.JSONObject

fun JSONObject.toGeometry(): Geometry? {
    when (this.optString("type")) {
        "polygon", "Polygon" -> return Polygon.fromJson(this.toString())
        else -> {
            Logger.w("JSONObject", "Unexpected geometry: ${this.toString()}")
            return null
        }
    }
}

fun JSONObject.toMapboxValue(): Value {
    return Value.fromJson(this.toString()).value!!
}

fun JSONObject.toWritableMap(): WritableMap? {
    val result = Arguments.createMap()
    val iterator = keys()
    while (iterator.hasNext()) {
        val key = iterator.next()
        val value = get(key)
        if (value is JSONObject) {
            result.putMap(key, value.toReadableMap());
        } else if (value is JSONArray) {
            result.putArray(key, value.toReadableArray());
        } else if (value is  Boolean) {
            result.putBoolean(key, value);
        } else if (value is  Int) {
            result.putInt(key, value);
        } else if (value is  Double) {
            result.putDouble(key, value);
        } else if (value is String)  {
            result.putString(key, value);
        } else {
            result.putString(key, value.toString());
        }
    }
    return result
}

fun JSONObject.toReadableMap(): ReadableMap? {
    return toWritableMap()
}

fun JSONArray.toReadableArray(): ReadableArray? {
    val result = Arguments.createArray()
    for (i in 0 until length()) {
        val value: Any = get(i)
        if (value is JSONObject) {
            result.pushMap(value.toReadableMap())
        } else if (value is JSONArray) {
            result.pushArray(value.toReadableArray())
        } else if (value is Boolean) {
            result.pushBoolean(value)
        } else if (value is Int) {
            result.pushInt(value)
        } else if (value is Double) {
            result.pushDouble(value)
        } else if (value is String) {
            result.pushString(value)
        } else {
            result.pushString(value.toString())
        }
    }
    return result
}
