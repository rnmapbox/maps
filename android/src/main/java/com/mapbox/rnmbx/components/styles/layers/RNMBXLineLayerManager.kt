package com.mapbox.rnmbx.components.styles.layers

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

class RNMBXLineLayerManager : ViewGroupManager<RNMBXLineLayer>() {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXLineLayer {
        return RNMBXLineLayer(reactContext)
    }

    @ReactProp(name = "id")
    fun setId(layer: RNMBXLineLayer, id: String?) {
        layer.iD = id
    }

    @ReactProp(name = "existing")
    fun setExisting(layer: RNMBXLineLayer, existing: Boolean) {
        layer.setExisting(existing)
    }

    @ReactProp(name = "sourceID")
    fun setSourceID(layer: RNMBXLineLayer, sourceID: String?) {
        layer.setSourceID(sourceID)
    }

    @ReactProp(name = "aboveLayerID")
    fun setAboveLayerID(layer: RNMBXLineLayer, aboveLayerID: String?) {
        layer.setAboveLayerID(aboveLayerID)
    }

    @ReactProp(name = "belowLayerID")
    fun setBelowLayerID(layer: RNMBXLineLayer, belowLayerID: String?) {
        layer.setBelowLayerID(belowLayerID)
    }

    @ReactProp(name = "layerIndex")
    fun setLayerIndex(layer: RNMBXLineLayer, layerIndex: Int) {
        layer.setLayerIndex(layerIndex)
    }

    @ReactProp(name = "minZoomLevel")
    fun setMinZoomLevel(layer: RNMBXLineLayer, minZoomLevel: Double) {
        layer.setMinZoomLevel(minZoomLevel)
    }

    @ReactProp(name = "maxZoomLevel")
    fun setMaxZoomLevel(layer: RNMBXLineLayer, maxZoomLevel: Double) {
        layer.setMaxZoomLevel(maxZoomLevel)
    }

    @ReactProp(name = "reactStyle")
    fun setReactStyle(layer: RNMBXLineLayer, style: ReadableMap?) {
        layer.setReactStyle(style)
    }

    @ReactProp(name = "sourceLayerID")
    fun setSourceLayerId(layer: RNMBXLineLayer, sourceLayerID: String?) {
        layer.setSourceLayerID(sourceLayerID)
    }

    @ReactProp(name = "filter")
    fun setFilter(layer: RNMBXLineLayer, filterList: ReadableArray?) {
        layer.setFilter(filterList)
    }

    companion object {
        const val REACT_CLASS = "RNMBXLineLayer"
    }
}