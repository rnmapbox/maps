package com.rnmapbox.rnmbx.utils.extensions

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.mapbox.maps.EdgeInsets
import com.rnmapbox.rnmbx.utils.ConvertUtils
import com.rnmapbox.rnmbx.utils.Logger

fun ReadableMap.forEach(action: (String, Any) -> Unit) {
    val iterator = this.entryIterator
    while (iterator.hasNext()) {
        val next = iterator.next()
        action(next.key, next.value)
    }
}
fun ReadableMap.getIfDouble(key: String): Double? {
    return if (hasKey(key) && (getType(key) == ReadableType.Number)) {
        getDouble(key)
    } else {
        null
    }
}

fun ReadableMap.getIfBoolean(key: String): Boolean? {
    return if (hasKey(key) && (getType(key) == ReadableType.Boolean)) {
        getBoolean(key)
    } else {
        null
    }
}

fun ReadableMap.getAndLogIfNotBoolean(key: String, tag:String = "RNMBXReadableMap"): Boolean? {
    return if (hasKey(key)) {
      if (getType(key) == ReadableType.Boolean) {
          getBoolean(key)
      } else {
          Logger.e("RNMBXReadableMap", "$key is expected to be a boolean but was: ${getType(key)}")
          null
      }
    } else {
        null
    }
}

/* If key is there it should be number or log otherwise */
fun ReadableMap.getAndLogIfNotDouble(key: String, tag: String = "RNMBXReadableMap"): Double? {
    return if (hasKey(key)) {
        if (getType(key) == ReadableType.Number) {
            getDouble(key)
        } else {
            Logger.e("RNMBXReadableMap", "$key is expected to be a double but was: ${getType(key)}")
            null
        }
    } else {
        null
    }
}

/* If key is there it should be string or log otherwise */
fun ReadableMap.getAndLogIfNotString(key: String, tag: String = "RNMBXReadableMap"): String? {
    return if (hasKey(key)) {
        if (getType(key) == ReadableType.String) {
            getString(key)
        } else {
            Logger.e("RNMBXReadableMap", "$key is expected to be a string but was: ${getType(key)}")
            null
        }
    } else {
        null
    }
}

fun ReadableMap.getAndLogIfNotMap(key: String, tag: String = "RNMBXReadableMap"): ReadableMap? {
    return if (hasKey(key)) {
        if (getType(key) == ReadableType.Map) {
            getMap(key)
        } else {
            Logger.e("RNMBXReadableMap", "$key is exected to be a Map but was: ${getType(key)}")
            null
        }
    } else {
        null
    }
}

fun ReadableMap.toJsonObject() : JsonObject {
    val result = JsonObject()
    val it = keySetIterator()
    while (it.hasNextKey()) {
        val key = it.nextKey()
        when (getType(key)) {
            ReadableType.Map -> result.add(key, getMap(key)!!.toJsonObject())
            ReadableType.Array -> result.add(key, getArray(key)!!.toJsonArray())
            ReadableType.Null -> result.add(key, null)
            ReadableType.Number -> result.addProperty(key, getDouble(key))
            ReadableType.String -> result.addProperty(key, getString(key))
            ReadableType.Boolean -> result.addProperty(key, getBoolean(key))
        }
    }
    return result
}

fun ReadableMap.toPadding(tag: String = "RNMBXReadableMap"): EdgeInsets? {
    var top: Double = 0.0
    var bottom: Double = 0.0
    var left: Double = 0.0
    var right: Double = 0.0
    var empty = true

    getAndLogIfNotDouble("top", tag)?.let {
        top = it
        empty = false
    }
    getAndLogIfNotDouble("bottom", tag)?.let {
        bottom = it
        empty = false
    }
    getAndLogIfNotDouble("left", tag)?.let {
        left = it
        empty = false
    }
    getAndLogIfNotDouble("right", tag)?.let {
        right = it
        empty = false
    }
    if (empty) {
        return null
    }
    return EdgeInsets(top, left, bottom, right)
}
