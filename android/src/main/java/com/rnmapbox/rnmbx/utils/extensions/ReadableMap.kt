package com.rnmapbox.rnmbx.utils.extensions

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType

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
