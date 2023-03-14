package com.mapbox.rctmgl.components.styles.layers

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

class RCTMGLCircleLayerManager : ViewGroupManager<RCTMGLCircleLayer>() {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLCircleLayer {
        return RCTMGLCircleLayer(reactContext)
    }

    @ReactProp(name = "id")
    fun setId(layer: RCTMGLCircleLayer, id: String?) {
        layer.iD = id
    }

    @ReactProp(name = "existing")
    fun setExisting(layer: RCTMGLCircleLayer, existing: Boolean) {
        layer.setExisting(existing)
    }

    @ReactProp(name = "sourceID")
    fun setSourceID(layer: RCTMGLCircleLayer, sourceID: String?) {
        layer.setSourceID(sourceID)
    }

    @ReactProp(name = "aboveLayerID")
    fun setAboveLayerID(layer: RCTMGLCircleLayer, aboveLayerID: String?) {
        layer.setAboveLayerID(aboveLayerID)
    }

    @ReactProp(name = "belowLayerID")
    fun setBelowLayerID(layer: RCTMGLCircleLayer, belowLayerID: String?) {
        layer.setBelowLayerID(belowLayerID)
    }

    @ReactProp(name = "layerIndex")
    fun setLayerIndex(layer: RCTMGLCircleLayer, layerIndex: Int) {
        layer.setLayerIndex(layerIndex)
    }

    @ReactProp(name = "minZoomLevel")
    fun setMinZoomLevel(layer: RCTMGLCircleLayer, minZoomLevel: Double) {
        layer.setMinZoomLevel(minZoomLevel)
    }

    @ReactProp(name = "maxZoomLevel")
    fun setMaxZoomLevel(layer: RCTMGLCircleLayer, maxZoomLevel: Double) {
        layer.setMaxZoomLevel(maxZoomLevel)
    }

    @ReactProp(name = "reactStyle")
    fun setReactStyle(layer: RCTMGLCircleLayer, style: ReadableMap?) {
        layer.setReactStyle(style)
    }

    @ReactProp(name = "sourceLayerID")
    fun setSourceLayerId(layer: RCTMGLCircleLayer, sourceLayerID: String?) {
        layer.setSourceLayerID(sourceLayerID)
    }

    @ReactProp(name = "filter")
    fun setFilter(layer: RCTMGLCircleLayer, filterList: ReadableArray?) {
        layer.setFilter(filterList)
    }

    companion object {
        const val REACT_CLASS = "RCTMGLCircleLayer"
    }
}