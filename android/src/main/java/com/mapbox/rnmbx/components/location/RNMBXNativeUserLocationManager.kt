package com.mapbox.rnmbx.components.location

import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.mapbox.rnmbx.utils.Logger
import javax.annotation.Nonnull

class RNMBXNativeUserLocationManager : ViewGroupManager<RNMBXNativeUserLocation>() {
    @Nonnull
    override fun getName(): String {
        return REACT_CLASS
    }

    @ReactProp(name = "androidRenderMode")
    fun setAndroidRenderMode(userLocation: RNMBXNativeUserLocation, mode: String) {
        when (mode) {
            "compass" -> userLocation.setAndroidRenderMode(RenderMode.COMPASS);
            "gps" -> userLocation.setAndroidRenderMode(RenderMode.GPS);
            "normal" -> userLocation.setAndroidRenderMode(RenderMode.NORMAL);
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