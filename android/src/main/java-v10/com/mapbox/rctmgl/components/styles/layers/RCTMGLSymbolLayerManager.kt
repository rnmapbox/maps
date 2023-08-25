package com.mapbox.rctmgl.components.styles.layers

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

class RCTMGLSymbolLayerManager : ViewGroupManager<RCTMGLSymbolLayer>() {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLSymbolLayer {
        return RCTMGLSymbolLayer(reactContext)
    }

    @ReactProp(name = "id")
    fun setId(layer: RCTMGLSymbolLayer, id: String?) {
        layer.iD = id
    }

    @ReactProp(name = "existing")
    fun setExisting(layer: RCTMGLSymbolLayer, existing: Boolean) {
        layer.setExisting(existing)
    }

    @ReactProp(name = "sourceID")
    fun setSourceID(layer: RCTMGLSymbolLayer, sourceID: String?) {
        layer.setSourceID(sourceID)
    }

    @ReactProp(name = "aboveLayerID")
    fun setAboveLayerID(layer: RCTMGLSymbolLayer, aboveLayerID: String?) {
        layer.setAboveLayerID(aboveLayerID)
    }

    @ReactProp(name = "belowLayerID")
    fun setBelowLayerID(layer: RCTMGLSymbolLayer, belowLayerID: String?) {
        layer.setBelowLayerID(belowLayerID)
    }

    @ReactProp(name = "layerIndex")
    fun setLayerIndex(layer: RCTMGLSymbolLayer, layerIndex: Int) {
        layer.setLayerIndex(layerIndex)
    }

    @ReactProp(name = "minZoomLevel")
    fun setMinZoomLevel(layer: RCTMGLSymbolLayer, minZoomLevel: Double) {
        layer.setMinZoomLevel(minZoomLevel)
    }

    @ReactProp(name = "maxZoomLevel")
    fun setMaxZoomLevel(layer: RCTMGLSymbolLayer, maxZoomLevel: Double) {
        layer.setMaxZoomLevel(maxZoomLevel)
    }

    @ReactProp(name = "reactStyle")
    fun setReactStyle(layer: RCTMGLSymbolLayer, style: ReadableMap?) {
        layer.setReactStyle(style)
    }

    @ReactProp(name = "sourceLayerID")
    fun setSourceLayerId(layer: RCTMGLSymbolLayer, sourceLayerID: String?) {
        layer.setSourceLayerID(sourceLayerID)
    }

    @ReactProp(name = "filter")
    fun setFilter(layer: RCTMGLSymbolLayer, filterList: ReadableArray?) {
        layer.setFilter(filterList)
    }

    companion object {
        const val REACT_CLASS = "RCTMGLSymbolLayer"
    }
}