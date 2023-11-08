package com.rnmapbox.rnmbx.utils.extensions

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
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
