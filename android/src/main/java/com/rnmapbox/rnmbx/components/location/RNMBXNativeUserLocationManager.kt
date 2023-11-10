package com.rnmapbox.rnmbx.components.location

import com.facebook.react.bridge.Dynamic
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXNativeUserLocationManagerInterface
import javax.annotation.Nonnull

class RNMBXNativeUserLocationManager : ViewGroupManager<RNMBXNativeUserLocation>(),
    RNMBXNativeUserLocationManagerInterface<RNMBXNativeUserLocation> {
    @Nonnull
    override fun getName(): String {
        return REACT_CLASS
    }

    @ReactProp(name = "androidRenderMode")
    override fun setAndroidRenderMode(userLocation: RNMBXNativeUserLocation, mode: Dynamic) {
        when (mode.asString()) {
            "compass" -> userLocation.setAndroidRenderMode(RenderMode.COMPASS)
            "gps" -> userLocation.setAndroidRenderMode(RenderMode.GPS)
            "normal" -> userLocation.setAndroidRenderMode(RenderMode.NORMAL)
        }
    }

    @ReactProp(name = "topImage")
    override fun setTopImage(view: RNMBXNativeUserLocation, value: Dynamic?) {
        view.mTopImage = value?.asString()
    }

    @ReactProp(name = "bearingImage")
    override fun setBearingImage(view: RNMBXNativeUserLocation, value: Dynamic?) {
        view.mBearingImage = value?.asString()
    }

    @ReactProp(name = "shadowImage")
    override fun setShadowImage(view: RNMBXNativeUserLocation, value: Dynamic?) {
        view.mShadowImage = value?.asString()
    }

    @ReactProp(name = "scale", defaultDouble = 1.0)
    override fun setScale(view: RNMBXNativeUserLocation, value: Dynamic?) {
        view.mScale = value?.asDouble() ?: 1.0
    }

    @ReactProp(name = "iosShowsUserHeadingIndicator")
    override fun setIosShowsUserHeadingIndicator(view: RNMBXNativeUserLocation, value: Dynamic) {
        // iOS only
    }

    @Nonnull
    override fun createViewInstance(@Nonnull reactContext: ThemedReactContext): RNMBXNativeUserLocation {
        return RNMBXNativeUserLocation(reactContext)
    }

    companion object {
        const val REACT_CLASS = "RNMBXNativeUserLocation"
    }
}