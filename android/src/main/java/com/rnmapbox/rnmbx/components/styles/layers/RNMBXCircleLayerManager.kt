package com.rnmapbox.rnmbx.components.styles.layers

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

class RNMBXCircleLayerManager : ViewGroupManager<RNMBXCircleLayer>() {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXCircleLayer {
        return RNMBXCircleLayer(reactContext)
    }

    @ReactProp(name = "id")
    fun setId(layer: RNMBXCircleLayer, id: String?) {
        layer.iD = id
    }

    @ReactProp(name = "existing")
    fun setExisting(layer: RNMBXCircleLayer, existing: Boolean) {
        layer.setExisting(existing)
    }

    @ReactProp(name = "sourceID")
    fun setSourceID(layer: RNMBXCircleLayer, sourceID: String?) {
        layer.setSourceID(sourceID)
    }

    @ReactProp(name = "aboveLayerID")
    fun setAboveLayerID(layer: RNMBXCircleLayer, aboveLayerID: String?) {
        layer.setAboveLayerID(aboveLayerID)
    }

    @ReactProp(name = "belowLayerID")
    fun setBelowLayerID(layer: RNMBXCircleLayer, belowLayerID: String?) {
        layer.setBelowLayerID(belowLayerID)
    }

    @ReactProp(name = "layerIndex")
    fun setLayerIndex(layer: RNMBXCircleLayer, layerIndex: Int) {
        layer.setLayerIndex(layerIndex)
    }

    @ReactProp(name = "minZoomLevel")
    fun setMinZoomLevel(layer: RNMBXCircleLayer, minZoomLevel: Double) {
        layer.setMinZoomLevel(minZoomLevel)
    }

    @ReactProp(name = "maxZoomLevel")
    fun setMaxZoomLevel(layer: RNMBXCircleLayer, maxZoomLevel: Double) {
        layer.setMaxZoomLevel(maxZoomLevel)
    }

    @ReactProp(name = "reactStyle")
    fun setReactStyle(layer: RNMBXCircleLayer, style: ReadableMap?) {
        layer.setReactStyle(style)
    }

    @ReactProp(name = "sourceLayerID")
    fun setSourceLayerId(layer: RNMBXCircleLayer, sourceLayerID: String?) {
        layer.setSourceLayerID(sourceLayerID)
    }

    @ReactProp(name = "filter")
    fun setFilter(layer: RNMBXCircleLayer, filterList: ReadableArray?) {
        layer.setFilter(filterList)
    }

    companion object {
        const val REACT_CLASS = "RNMBXCircleLayer"
    }
}