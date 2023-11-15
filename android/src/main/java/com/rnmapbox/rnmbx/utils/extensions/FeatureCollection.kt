package com.rnmapbox.rnmbx.utils.extensions

import com.mapbox.geojson.FeatureCollection
import com.mapbox.geojson.GeometryCollection

fun FeatureCollection.toGeometryCollection(): GeometryCollection {
    return GeometryCollection.fromGeometries(
        this.features()!!.map { it.geometry() !! }
    )
}