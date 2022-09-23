package com.mapbox.rctmgl.components.styles.atmosphere

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

class RCTMGLAtmosphereManager : ViewGroupManager<RCTMGLAtmosphere>() {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLAtmosphere {
        return RCTMGLAtmosphere(reactContext)
    }

    @ReactProp(name = "id")
    fun setId(layer: RCTMGLAtmosphere, id: String?) {
        layer.iD = id
    }

    @ReactProp(name = "reactStyle")
    fun setReactStyle(atmosphere: RCTMGLAtmosphere, reactStyle: ReadableMap?) {
        atmosphere.setReactStyle(reactStyle)
    }

    companion object {
        const val REACT_CLASS = "RCTMGLAtmosphere"
    }
}