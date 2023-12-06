package com.rnmapbox.rnmbx.v11compat.light;

import com.mapbox.maps.Style
import com.mapbox.maps.extension.style.light.generated.Light as _Light;
import com.mapbox.maps.extension.style.light.generated.setLight as _setLight

typealias Light = _Light

fun Style.setLight(light: Light) {
    this._setLight(light)
}

fun createLight(): Light {
    return Light()
}
