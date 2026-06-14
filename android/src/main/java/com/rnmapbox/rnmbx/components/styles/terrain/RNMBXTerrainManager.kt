package com.rnmapbox.rnmbx.components.styles.terrain

import com.facebook.react.bridge.Dynamic
import com.facebook.react.uimanager.ThemedReactContext
import com.rnmapbox.rnmbx.utils.extensions.asMapOrNull
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXTerrainManagerInterface
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.RNMBXTerrainManagerDelegate

class RNMBXTerrainManager : ViewGroupManager<RNMBXTerrain>(),
    RNMBXTerrainManagerInterface<RNMBXTerrain> {

    private val delegate = RNMBXTerrainManagerDelegate<RNMBXTerrain, RNMBXTerrainManager>(this)

    override fun getDelegate(): ViewManagerDelegate<RNMBXTerrain> = delegate
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXTerrain {
        return RNMBXTerrain(reactContext)
    }

    @ReactProp(name = "sourceID")
    override fun setSourceID(layer: RNMBXTerrain, sourceID: Dynamic) {
        layer.setSourceID(sourceID.asString())
    }

    @ReactProp(name = "reactStyle")
    override fun setReactStyle(terrain: RNMBXTerrain, reactStyle: Dynamic) {
        terrain.setReactStyle(reactStyle.asMapOrNull())
    }

    companion object {
        const val REACT_CLASS = "RNMBXTerrain"
    }
}