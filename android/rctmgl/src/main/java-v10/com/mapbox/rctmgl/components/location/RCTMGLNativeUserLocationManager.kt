package com.mapbox.rctmgl.components.location

import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.mapbox.rctmgl.utils.Logger
import javax.annotation.Nonnull

class RCTMGLNativeUserLocationManager : ViewGroupManager<RCTMGLNativeUserLocation>() {
    @Nonnull
    override fun getName(): String {
        return REACT_CLASS
    }

    @ReactProp(name = "androidRenderMode")
    fun setAndroidRenderMode(userLocation: RCTMGLNativeUserLocation?, mode: String?) {
        Logger.w("RCTMGLNativeUserLocationManager", "setAndroidRenderMode is deprecated in v10");
    }

    @Nonnull
    override fun createViewInstance(@Nonnull reactContext: ThemedReactContext): RCTMGLNativeUserLocation {
        return RCTMGLNativeUserLocation(reactContext)
    }

    companion object {
        const val REACT_CLASS = "RCTMGLNativeUserLocation"
    }
}