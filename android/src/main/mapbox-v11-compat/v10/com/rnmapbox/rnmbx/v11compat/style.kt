package com.rnmapbox.rnmbx.v11compat.style;

import com.mapbox.bindgen.Value
import com.mapbox.maps.Style
import com.rnmapbox.rnmbx.utils.Logger

fun Style?.setStyleImportConfigProperties(id: String, config: HashMap<String, Value>) {
    Logger.w("RNBMXStyleImport", "Style imports only supported on mapbox v11")
}
