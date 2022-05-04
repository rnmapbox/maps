package com.mapbox.rctmgl.components.styles.terrain

import com.facebook.react.bridge.Dynamic
import com.mapbox.rctmgl.components.styles.sources.AbstractSourceConsumer
import com.mapbox.maps.extension.style.terrain.generated.Terrain
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.facebook.react.bridge.ReadableType
import com.facebook.react.uimanager.ViewGroupManager
import com.mapbox.rctmgl.components.styles.terrain.RCTMGLTerrain
import com.mapbox.rctmgl.components.styles.terrain.RCTMGLTerrainManager
import com.facebook.react.uimanager.ThemedReactContext
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
        layer.setID(id)
    }

    @ReactProp(name = "sourceID")
    fun setSourceID(layer: RCTMGLTerrain, sourceID: String?) {
        layer.setSourceID(sourceID)
    }

    @ReactProp(name = "exaggeration")
    fun setExaggeration(layer: RCTMGLTerrain, exaggeration: Dynamic?) {
        layer.setExaggeration(exaggeration)
    }

    companion object {
        const val REACT_CLASS = "RCTMGLTerrain"
    }
}