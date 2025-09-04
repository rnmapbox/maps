package com.rnmapbox.rnmbx.utils

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.mapbox.bindgen.Value
import com.rnmapbox.rnmbx.utils.extensions.toStringKeyPairs


fun writableMapOf(vararg values: Pair<String, *>): WritableMap {
    val map = Arguments.createMap()
    for ((key, value) in values) {
        when (value) {
            null -> map.putNull(key)
            is Boolean -> map.putBoolean(key, value)
            is Double -> map.putDouble(key, value)
            is Int -> map.putInt(key, value)
            is Long -> map.putInt(key, value.toInt())
            is String -> map.putString(key, value)
            is Map<*,*> -> map.putMap(key, writableMapOf(*value.toStringKeyPairs()))
            is Array<*> -> map.putArray(key, writableArrayOf(*value.map{ it as Any }.toTypedArray()))
            is WritableMap -> map.putMap(key, value)
            is WritableArray -> map.putArray(key, value)
            is Value -> {
                val contents = value.contents
                when (contents) {
                    null -> map.putNull(key)
                    is Boolean -> map.putBoolean(key, contents)
                    is Double -> map.putDouble(key, contents)
                    is Int -> map.putInt(key, contents)
                    is Long -> map.putInt(key, contents.toInt())
                    is String -> map.putString(key, contents)
                    is WritableMap -> map.putMap(key, contents)
                    is WritableArray -> map.putArray(key, contents)
                }
            }
            else -> throw IllegalArgumentException("Unsupported value type ${value::class.java.name} for key [$key]")
        }
    }
    return map
}

fun writableArrayOf(vararg values: Any): WritableArray {
    val array = Arguments.createArray()
    for (value in values) {
        when (value) {
            null -> array.pushNull()
            is Boolean -> array.pushBoolean(value)
            is Double -> array.pushDouble(value)
            is Int -> array.pushInt(value)
            is Long -> array.pushInt(value.toInt())
            is String -> array.pushString(value)
            is Map<*,*> -> array.pushMap(writableMapOf(*value.toStringKeyPairs()))
            is Array<*> -> array.pushArray(writableArrayOf(*value.map{ it as Any }.toTypedArray()))
            is WritableMap -> array.pushMap(value)
            is WritableArray -> array.pushArray(value)
            is Value -> {
                val contents = value.contents
                when (contents) {
                    null -> array.pushNull()
                    is Boolean -> array.pushBoolean(contents)
                    is Double -> array.pushDouble(contents)
                    is Int -> array.pushInt(contents)
                    is Long -> array.pushInt(contents.toInt())
                    is String -> array.pushString(contents)
                    is Map<*,*> -> array.pushMap(writableMapOf(*contents.toStringKeyPairs()))
                    is Array<*> -> array.pushArray(writableArrayOf(*contents.map{ it as Any }.toTypedArray()))
                    is WritableMap -> array.pushMap(contents)
                    is WritableArray -> array.pushArray(contents)
                }
            }
            else -> throw IllegalArgumentException("Unsupported value type ${value::class.java.name}")
        }
    }
    return array
}