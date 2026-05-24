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
import com.rnmapbox.rnmbx.components.location.RNMBXNativeUserLocationManager.Companion.TAG
import com.rnmapbox.rnmbx.rncompat.dynamic.*
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.utils.extensions.asBooleanOrNull
import com.rnmapbox.rnmbx.utils.extensions.asStringOrNull
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
        mode.asStringOrNull()?.let {
            Logger.e(TAG, "androidRenderMode is deprecated, use puckBearing instead")

            when (it) {
                "compass" -> userLocation.androidRenderMode = RenderMode.COMPASS
                "gps" -> userLocation.androidRenderMode = RenderMode.GPS
                "normal" -> userLocation.androidRenderMode = RenderMode.NORMAL
            }
        }
    }

    @ReactProp(name = "puckBearing")
    override fun setPuckBearing(view: RNMBXNativeUserLocation, value: Dynamic) {
        when (value.asStringOrNull()) {
            "heading" -> view.puckBearing = PuckBearing.HEADING
            "course" -> view.puckBearing = PuckBearing.COURSE
            null -> Unit
            else ->
                Logger.e(TAG, "unexpected value for puckBearing: $value")
        }
    }

    @ReactProp(name = "puckBearingEnabled")
    override fun setPuckBearingEnabled(view: RNMBXNativeUserLocation, value: Dynamic) {
        value.asBooleanOrNull()?.let {
            view.puckBearingEnabled = it
        } ?: run {
            Logger.e(TAG, "unexpected value for puckBearingEnabled: $value")
        }
    }

    @ReactProp(name = "topImage")
    override fun setTopImage(view: RNMBXNativeUserLocation, value: Dynamic?) {
        view.topImage = value?.asStringOrNull()
    }

    @ReactProp(name = "bearingImage")
    override fun setBearingImage(view: RNMBXNativeUserLocation, value: Dynamic?) {
        view.bearingImage = value?.asStringOrNull()
    }

    @ReactProp(name = "shadowImage")
    override fun setShadowImage(view: RNMBXNativeUserLocation, value: Dynamic?) {
        view.shadowImage = value?.asStringOrNull()
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
        const val TAG = "RNMBXNativeUserLocationManager"
    }
}

fun _convertToDoubleValueOrExpression(value: Dynamic?, name: String): Value? {
    if (value == null) {
        return null
    }
    return when (value.type) {
        ReadableType.Array -> {
            val array = value.asArray()
            if (array == null) {
                Logger.e(TAG, "_convertToDoubleValueOrExpression: array is null for $name")
                return null
            }
            Expression.fromRaw(Gson().toJson(array.toJsonArray()))
        }
        ReadableType.Number ->
            Value.valueOf(value.asDouble())
        else -> {
            Logger.e(
                TAG,
                "_convertToExpressionString: cannot convert $name to a double or double expression. $value"
            )
            null
        }
    }
}
