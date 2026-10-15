package com.rnmapbox.rnmbx.components.styles.rain

import com.facebook.react.bridge.Dynamic
import com.facebook.react.uimanager.ThemedReactContext
import com.rnmapbox.rnmbx.utils.extensions.asMapOrNull
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXRainManagerDelegate
import com.facebook.react.viewmanagers.RNMBXRainManagerInterface

class RNMBXRainManager : ViewGroupManager<RNMBXRain>(), RNMBXRainManagerInterface<RNMBXRain> {

    private val mDelegate: ViewManagerDelegate<RNMBXRain>

    init {
        mDelegate = RNMBXRainManagerDelegate(this)
    }

    override fun getDelegate(): ViewManagerDelegate<RNMBXRain> {
        return mDelegate
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXRain {
        return RNMBXRain(reactContext)
    }

    @ReactProp(name = "reactStyle")
    override fun setReactStyle(rain: RNMBXRain, reactStyle: Dynamic) {
        rain.setReactStyle(reactStyle.asMapOrNull())
    }

    companion object {
        const val REACT_CLASS = "RNMBXRain"
    }
}
