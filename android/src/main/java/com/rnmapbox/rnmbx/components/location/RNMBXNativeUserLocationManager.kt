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
    fun setAndroidRenderMode(userLocation: RNMBXNativeUserLocation, mode: String) {
        when (mode) {
            "compass" -> userLocation.setAndroidRenderMode(RenderMode.COMPASS)
            "gps" -> userLocation.setAndroidRenderMode(RenderMode.GPS)
            "normal" -> userLocation.setAndroidRenderMode(RenderMode.NORMAL)
        }
    }

    @ReactProp(name = "topImage")
    fun setTopImage(userLocation: RNMBXNativeUserLocation, topImage: String?) {
        userLocation.mTopImage = topImage
    }

    @ReactProp(name = "bearingImage")
    fun setBearingImage(userLocation: RNMBXNativeUserLocation, bearingImage: String?) {
        userLocation.mBearingImage = bearingImage
    }

    @ReactProp(name = "shadowImage")
    fun setShadowImage(userLocation: RNMBXNativeUserLocation, shadowImage: String?) {
        userLocation.mShadowImage = shadowImage
    }

    @ReactProp(name = "scale", defaultDouble = 1.0)
    fun setScale(userLocation: RNMBXNativeUserLocation, scale: Double) {
        userLocation.mScale = scale
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