package com.rnmapbox.rnmbx.components.styles.layers

import com.facebook.react.bridge.Dynamic
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXBackgroundLayerManagerInterface

class RNMBXBackgroundLayerManager : ViewGroupManager<RNMBXBackgroundLayer>(),
    RNMBXBackgroundLayerManagerInterface<RNMBXBackgroundLayer> {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXBackgroundLayer {
        return RNMBXBackgroundLayer(reactContext)
    }

    @ReactProp(name = "id")
    override fun setId(layer: RNMBXBackgroundLayer, id: Dynamic) {
        layer.iD = id.asString()
    }

    @ReactProp(name = "existing")
    override fun setExisting(layer: RNMBXBackgroundLayer, existing: Dynamic) {
        layer.setExisting(existing.asBoolean())
    }

    @ReactProp(name = "sourceID")
    override fun setSourceID(layer: RNMBXBackgroundLayer, sourceID: Dynamic) {
        layer.setSourceID(sourceID.asString())
    }

    @ReactProp(name = "aboveLayerID")
    override fun setAboveLayerID(layer: RNMBXBackgroundLayer, aboveLayerID: Dynamic) {
        layer.setAboveLayerID(aboveLayerID.asString())
    }

    @ReactProp(name = "belowLayerID")
    override fun setBelowLayerID(layer: RNMBXBackgroundLayer, belowLayerID: Dynamic) {
        layer.setBelowLayerID(belowLayerID.asString())
    }

    @ReactProp(name = "layerIndex")
    override fun setLayerIndex(layer: RNMBXBackgroundLayer, layerIndex: Dynamic) {
        layer.setLayerIndex(layerIndex.asInt())
    }

    @ReactProp(name = "minZoomLevel")
    override fun setMinZoomLevel(layer: RNMBXBackgroundLayer, minZoomLevel: Dynamic) {
        layer.setMinZoomLevel(minZoomLevel.asDouble())
    }

    @ReactProp(name = "maxZoomLevel")
    override fun setMaxZoomLevel(layer: RNMBXBackgroundLayer, maxZoomLevel: Dynamic) {
        layer.setMaxZoomLevel(maxZoomLevel.asDouble())
    }

    @ReactProp(name = "reactStyle")
    override fun setReactStyle(layer: RNMBXBackgroundLayer, style: Dynamic) {
        layer.setReactStyle(style.asMap())
    }

    @ReactProp(name = "filter")
    override fun setFilter(layer: RNMBXBackgroundLayer, filterList: Dynamic) {
        layer.setFilter(filterList.asArray())
    }

    companion object {
        const val REACT_CLASS = "RNMBXBackgroundLayer"
    }
}