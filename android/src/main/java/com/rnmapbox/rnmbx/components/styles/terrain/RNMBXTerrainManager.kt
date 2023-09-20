package com.rnmapbox.rnmbx.components.styles.terrain

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

class RNMBXTerrainManager : ViewGroupManager<RNMBXTerrain>() {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXTerrain {
        return RNMBXTerrain(reactContext)
    }

    @ReactProp(name = "id")
    fun setId(layer: RNMBXTerrain, id: String?) {
        layer.iD = id
    }

    @ReactProp(name = "sourceID")
    fun setSourceID(layer: RNMBXTerrain, sourceID: String?) {
        layer.setSourceID(sourceID)
    }

    @ReactProp(name = "reactStyle")
    fun setReactStyle(terrain: RNMBXTerrain, reactStyle: ReadableMap?) {
        terrain.setReactStyle(reactStyle)
    }

    companion object {
        const val REACT_CLASS = "RNMBXTerrain"
    }
}