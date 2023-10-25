package com.rnmapbox.rnmbx.components.styles.atmosphere

import com.facebook.react.bridge.Dynamic
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXAtmosphereManagerDelegate
import com.facebook.react.viewmanagers.RNMBXAtmosphereManagerInterface

class RNMBXAtmosphereManager : ViewGroupManager<RNMBXAtmosphere>(), RNMBXAtmosphereManagerInterface<RNMBXAtmosphere> {

    private val mDelegate: ViewManagerDelegate<RNMBXAtmosphere>

    init {
        mDelegate = RNMBXAtmosphereManagerDelegate(this)
    }

    override fun getDelegate(): ViewManagerDelegate<RNMBXAtmosphere> {
        return mDelegate
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXAtmosphere {
        return RNMBXAtmosphere(reactContext)
    }

    @ReactProp(name = "reactStyle")
    override fun setReactStyle(atmosphere: RNMBXAtmosphere, reactStyle: Dynamic) {
        atmosphere.setReactStyle(reactStyle.asMap())
    }

    companion object {
        const val REACT_CLASS = "RNMBXAtmosphere"
    }
}