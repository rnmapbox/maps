package com.mapbox.rnmbx.components.styles.atmosphere

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

class RNMBXAtmosphereManager : ViewGroupManager<RNMBXAtmosphere>() {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXAtmosphere {
        return RNMBXAtmosphere(reactContext)
    }

    @ReactProp(name = "id")
    fun setId(layer: RNMBXAtmosphere, id: String?) {
        layer.iD = id
    }

    @ReactProp(name = "reactStyle")
    fun setReactStyle(atmosphere: RNMBXAtmosphere, reactStyle: ReadableMap?) {
        atmosphere.setReactStyle(reactStyle)
    }

    companion object {
        const val REACT_CLASS = "RNMBXAtmosphere"
    }
}