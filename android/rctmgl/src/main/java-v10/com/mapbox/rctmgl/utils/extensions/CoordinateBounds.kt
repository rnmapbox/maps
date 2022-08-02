package com.mapbox.rctmgl.utils.extensions

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.mapbox.maps.CoordinateBounds
import com.mapbox.rctmgl.utils.GeoJSONUtils
import com.mapbox.rctmgl.utils.LatLng

fun CoordinateBounds.toReadableArray() : ReadableArray {
    val array = Arguments.createArray()
    val ne = northeast
    val sw = southwest
    val latLngs = arrayOf(
        LatLng(ne.latitude(), ne.longitude()),
        LatLng(ne.latitude(), sw.longitude()),
        LatLng(sw.latitude(), sw.longitude()),
        LatLng(sw.latitude(), ne.longitude())
    )
    for (latLng in latLngs) {
        array.pushArray(GeoJSONUtils.fromLatLng(latLng))
    }
    return array
}