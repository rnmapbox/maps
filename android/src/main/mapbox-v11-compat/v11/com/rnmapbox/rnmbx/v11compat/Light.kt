package com.rnmapbox.rnmbx.v11compat.light;
import com.mapbox.maps.Style
import com.mapbox.maps.extension.style.light.generated.FlatLight
import com.mapbox.maps.extension.style.light.generated.flatLight
import com.mapbox.maps.extension.style.light.setLight as _setLight

public typealias Light = FlatLight;

fun Style.setLight(light: FlatLight) {
    this._setLight(light)
}

fun createLight(): Light {
    return flatLight() {}
}
