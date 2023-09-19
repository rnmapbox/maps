package com.mapbox.rnmbx.utils.extensions

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableNativeArray
import com.mapbox.geojson.Point
import com.mapbox.rnmbx.utils.Logger

fun Point.toReadableArray() : ReadableArray {
    val array = WritableNativeArray()
    array.pushDouble(this.longitude())
    array.pushDouble(this.latitude())
    return array
}

fun Point.toDoubleArray() : DoubleArray {
    return doubleArrayOf(this.longitude(), this.latitude())
}
