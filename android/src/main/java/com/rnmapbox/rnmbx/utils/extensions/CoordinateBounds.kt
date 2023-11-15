package com.rnmapbox.rnmbx.utils.extensions

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.mapbox.maps.CoordinateBounds
import com.rnmapbox.rnmbx.utils.GeoJSONUtils
import com.rnmapbox.rnmbx.utils.LatLng

fun CoordinateBounds.toReadableArray() : ReadableArray {
    val array = Arguments.createArray()
    val ne = northeast
    val sw = southwest

    array.pushArray(GeoJSONUtils.fromLatLng(LatLng(ne.latitude(), ne.longitude())));
    array.pushArray(GeoJSONUtils.fromLatLng(LatLng(sw.latitude(), sw.longitude())));
    return array
}