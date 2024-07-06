package com.rnmapbox.rnmbx.components.location

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXNativeUserLocationManagerInterface
import com.google.gson.Gson
import com.google.gson.stream.JsonWriter
import com.mapbox.bindgen.Value
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.rnmapbox.rnmbx.rncompat.dynamic.*
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.utils.extensions.toJsonArray
import java.io.StringWriter
import javax.annotation.Nonnull
import com.rnmapbox.rnmbx.v11compat.location.*

class RNMBXNativeUserLocationManager : ViewGroupManager<RNMBXNativeUserLocation>(),
    RNMBXNativeUserLocationManagerInterface<RNMBXNativeUserLocation> {
    @Nonnull
    override fun getName(): String {
        return REACT_CLASS
    }

    @ReactProp(name = "androidRenderMode")
    override fun setAndroidRenderMode(userLocation: RNMBXNativeUserLocation, mode: Dynamic) {
        if (!mode.isNull) {
            Logger.e("RNMBXNativeUserLocationManager", "androidRenderMode is deprecated, use puckBearing instead")
        }
        when (mode.asString()) {
            "compass" -> userLocation.androidRenderMode = RenderMode.COMPASS
            "gps" -> userLocation.androidRenderMode = RenderMode.GPS
            "normal" -> userLocation.androidRenderMode = RenderMode.NORMAL
        }
    }

    @ReactProp(name = "puckBearing")
    override fun setPuckBearing(view: RNMBXNativeUserLocation, value: Dynamic) {
        when (value?.asString()) {
            "heading" -> view.puckBearing = PuckBearing.HEADING
            "course" -> view.puckBearing = PuckBearing.COURSE
            null -> Unit
            else ->
                Logger.e("RNMBXNativeUserLocationManager", "unexpected value for puckBearing: $value")
        }
    }

    @ReactProp(name = "puckBearingEnabled")
    override fun setPuckBearingEnabled(view: RNMBXNativeUserLocation, value: Dynamic) {
        if (!value.isNull) {
            if (value.type == ReadableType.Boolean) {
                view.puckBearingEnabled = value.asBoolean()
            } else {
                Logger.e("RNMBXNativeUserLocationManager", "unexpected value for puckBearingEnabled: $value")
            }
        }
    }

    @ReactProp(name = "topImage")
    override fun setTopImage(view: RNMBXNativeUserLocation, value: Dynamic?) {
        view.topImage = value?.asString()
    }

    @ReactProp(name = "bearingImage")
    override fun setBearingImage(view: RNMBXNativeUserLocation, value: Dynamic?) {
        view.bearingImage = value?.asString()
    }

    @ReactProp(name = "shadowImage")
    override fun setShadowImage(view: RNMBXNativeUserLocation, value: Dynamic?) {
        view.shadowImage = value?.asString()
    }

    @ReactProp(name = "scale", defaultDouble = 1.0)
    override fun setScale(view: RNMBXNativeUserLocation, value: Dynamic?) {
        view.scale = _convertToDoubleValueOrExpression(value, "scale")
    }

    @ReactProp(name = "visible")
    override fun setVisible(view: RNMBXNativeUserLocation, value: Boolean) {
        view.visible = value
    }

    @ReactProp(name = "pulsing")
    override fun setPulsing(view: RNMBXNativeUserLocation, value: Dynamic) {
        if (!value.isNull) {
            view.pulsing = value.asMap()
        }
    }

    @Nonnull
    override fun createViewInstance(@Nonnull reactContext: ThemedReactContext): RNMBXNativeUserLocation {
        return RNMBXNativeUserLocation(reactContext)
    }

    companion object {
        const val REACT_CLASS = "RNMBXNativeUserLocation"
    }
}



fun _convertToDoubleValueOrExpression(value: Dynamic?, name: String): Value? {
    if (value == null) {
        return null
    }
    return when (value.type) {
        ReadableType.Array ->
            Expression.fromRaw(Gson().toJson(value.asArray().toJsonArray()))
        ReadableType.Number ->
            Value.valueOf(value.asDouble())
        else -> {
            Logger.e(
                "RNMBXNativeUserLocationmanager",
                "_convertToExpressionString: cannot convert $name to a double or double exrpession. $value"
            )
            return null
        }
    }
}
