package com.mapbox.rctmgl.components.styles.terrain

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

class RCTMGLTerrainManager : ViewGroupManager<RCTMGLTerrain>() {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLTerrain {
        return RCTMGLTerrain(reactContext)
    }

    @ReactProp(name = "id")
    fun setId(layer: RCTMGLTerrain, id: String?) {
        layer.iD = id
    }

    @ReactProp(name = "sourceID")
    fun setSourceID(layer: RCTMGLTerrain, sourceID: String?) {
        layer.setSourceID(sourceID)
    }

    @ReactProp(name = "reactStyle")
    fun setReactStyle(terrain: RCTMGLTerrain, reactStyle: ReadableMap?) {
        terrain.setReactStyle(reactStyle)
    }

    companion object {
        const val REACT_CLASS = "RCTMGLTerrain"
    }
}