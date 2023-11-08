package com.rnmapbox.rnmbx.utils.extensions

import com.mapbox.geojson.BoundingBox
import com.mapbox.geojson.Geometry
import com.mapbox.geojson.Polygon
import com.mapbox.turf.TurfMeasurement
import org.json.JSONObject

fun Geometry.toJSONObject(): JSONObject? {
    return JSONObject(this.toJson())
}

fun Geometry.calculateBoundingBox(): BoundingBox {
    val storedBBox = bbox()
    if (storedBBox != null) {
        return storedBBox
    }
    val bbox = TurfMeasurement.bbox(this)
    return BoundingBox.fromLngLats(
        bbox[0], bbox[1], bbox[2], bbox[3]
    )
}