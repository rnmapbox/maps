package com.rnmapbox.rnmbx.components.styles.terrain

import com.facebook.react.bridge.Dynamic
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXTerrainManagerInterface

class RNMBXTerrainManager : ViewGroupManager<RNMBXTerrain>(),
    RNMBXTerrainManagerInterface<RNMBXTerrain> {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXTerrain {
        return RNMBXTerrain(reactContext)
    }

    // TODO: it is not present in props so should we add it?
//    @ReactProp(name = "id")
//    override fun setId(layer: RNMBXTerrain, id: Dynamic) {
//        layer.iD = id.asString()
//    }

    @ReactProp(name = "sourceID")
    override fun setSourceID(layer: RNMBXTerrain, sourceID: Dynamic) {
        layer.setSourceID(sourceID.asString())
    }

    @ReactProp(name = "reactStyle")
    override fun setReactStyle(terrain: RNMBXTerrain, reactStyle: Dynamic) {
        terrain.setReactStyle(reactStyle.asMap())
    }

    companion object {
        const val REACT_CLASS = "RNMBXTerrain"
    }
}