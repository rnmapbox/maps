package com.mapbox.rctmgl.components.styles.layers

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

class RCTMGLSkyLayerManager : ViewGroupManager<RCTMGLSkyLayer>() {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLSkyLayer {
        return RCTMGLSkyLayer(reactContext)
    }

    @ReactProp(name = "id")
    fun setId(layer: RCTMGLSkyLayer, id: String?) {
        layer.iD = id
    }

    @ReactProp(name = "existing")
    fun setExisting(layer: RCTMGLSkyLayer, existing: Boolean) {
        layer.setExisting(existing)
    }

    @ReactProp(name = "sourceID")
    fun setSourceID(layer: RCTMGLSkyLayer, sourceID: String?) {
        layer.setSourceID(sourceID)
    }

    @ReactProp(name = "aboveLayerID")
    fun setAboveLayerID(layer: RCTMGLLineLayer, aboveLayerID: String?) {
        layer.setAboveLayerID(aboveLayerID)
    }

    @ReactProp(name = "belowLayerID")
    fun setBelowLayerID(layer: RCTMGLLineLayer, belowLayerID: String?) {
        layer.setBelowLayerID(belowLayerID)
    }

    @ReactProp(name = "layerIndex")
    fun setLayerIndex(layer: RCTMGLLineLayer, layerIndex: Int) {
        layer.setLayerIndex(layerIndex)
    }

    @ReactProp(name = "minZoomLevel")
    fun setMinZoomLevel(layer: RCTMGLLineLayer, minZoomLevel: Double) {
        layer.setMinZoomLevel(minZoomLevel)
    }

    @ReactProp(name = "maxZoomLevel")
    fun setMaxZoomLevel(layer: RCTMGLSkyLayer, maxZoomLevel: Double) {
        layer.setMaxZoomLevel(maxZoomLevel)
    }

    @ReactProp(name = "reactStyle")
    fun setReactStyle(layer: RCTMGLSkyLayer, style: ReadableMap?) {
        layer.setReactStyle(style)
    }

    @ReactProp(name = "sourceLayerID")
    fun setSourceLayerId(layer: RCTMGLSkyLayer, sourceLayerID: String?) {
        layer.setSourceLayerID(sourceLayerID)
    }

    @ReactProp(name = "filter")
    fun setFilter(layer: RCTMGLSkyLayer, filterList: ReadableArray?) {
        layer.setFilter(filterList)
    }

    companion object {
        const val REACT_CLASS = "RCTMGLSkyLayer"
    }
}