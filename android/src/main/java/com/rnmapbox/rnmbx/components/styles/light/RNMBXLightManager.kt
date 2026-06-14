package com.rnmapbox.rnmbx.components.styles.light

import com.facebook.react.bridge.Dynamic
import com.facebook.react.uimanager.ThemedReactContext
import com.rnmapbox.rnmbx.utils.extensions.asMapOrNull
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXLightManagerInterface
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.RNMBXLightManagerDelegate

class RNMBXLightManager : ViewGroupManager<RNMBXLight>(),
    RNMBXLightManagerInterface<RNMBXLight> {

    private val delegate = RNMBXLightManagerDelegate<RNMBXLight, RNMBXLightManager>(this)

    override fun getDelegate(): ViewManagerDelegate<RNMBXLight> = delegate
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXLight {
        return RNMBXLight(reactContext)
    }

    @ReactProp(name = "reactStyle")
    override fun setReactStyle(light: RNMBXLight, reactStyle: Dynamic) {
        light.setReactStyle(reactStyle.asMapOrNull())
    }

    companion object {
        const val REACT_CLASS = "RNMBXLight"
    }
}