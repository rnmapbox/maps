package com.rnmapbox.rnmbx.utils.extensions

import com.mapbox.bindgen.Value
import org.json.JSONObject

fun Value.toJSONObject(): JSONObject? {
    val jsonString = this.toJson()
    return JSONObject(jsonString)
}