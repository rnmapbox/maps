package com.mapbox.rnmbx.components.styles.layers

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

class RNMBXRasterLayerManager : ViewGroupManager<RNMBXRasterLayer>() {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXRasterLayer {
        return RNMBXRasterLayer(reactContext)
    }

    @ReactProp(name = "id")
    fun setId(layer: RNMBXRasterLayer, id: String?) {
        layer.iD = id
    }

    @ReactProp(name = "existing")
    fun setExisting(layer: RNMBXRasterLayer, existing: Boolean) {
        layer.setExisting(existing)
    }

    @ReactProp(name = "sourceID")
    fun setSourceID(layer: RNMBXRasterLayer, sourceID: String?) {
        layer.setSourceID(sourceID)
    }

    @ReactProp(name = "aboveLayerID")
    fun setAboveLayerID(layer: RNMBXRasterLayer, aboveLayerID: String?) {
        layer.setAboveLayerID(aboveLayerID)
    }

    @ReactProp(name = "belowLayerID")
    fun setBelowLayerID(layer: RNMBXRasterLayer, belowLayerID: String?) {
        layer.setBelowLayerID(belowLayerID)
    }

    @ReactProp(name = "layerIndex")
    fun setLayerIndex(layer: RNMBXRasterLayer, layerIndex: Int) {
        layer.setLayerIndex(layerIndex)
    }

    @ReactProp(name = "minZoomLevel")
    fun setMinZoomLevel(layer: RNMBXRasterLayer, minZoomLevel: Double) {
        layer.setMinZoomLevel(minZoomLevel)
    }

    @ReactProp(name = "maxZoomLevel")
    fun setMaxZoomLevel(layer: RNMBXRasterLayer, maxZoomLevel: Double) {
        layer.setMaxZoomLevel(maxZoomLevel)
    }

    @ReactProp(name = "reactStyle")
    fun setReactStyle(layer: RNMBXRasterLayer, style: ReadableMap?) {
        layer.setReactStyle(style)
    }

    companion object {
        const val REACT_CLASS = "RNMBXRasterLayer"
    }
}