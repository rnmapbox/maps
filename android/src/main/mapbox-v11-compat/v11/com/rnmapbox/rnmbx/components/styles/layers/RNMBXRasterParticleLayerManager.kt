package com.rnmapbox.rnmbx.components.styles.layers

import com.facebook.react.bridge.Dynamic
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXRasterParticleLayerManagerInterface

class RNMBXRasterParticleLayerManager : ViewGroupManager<RNMBXRasterParticleLayer>(),
    RNMBXRasterParticleLayerManagerInterface<RNMBXRasterParticleLayer> {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXRasterParticleLayer {
        return RNMBXRasterParticleLayer(reactContext)
    }

    // @{codepart-replace-start(LayerManagerCommonProps.codepart-kt.ejs,{layerType:"RNMBXRasterParticleLayer"})}
    @ReactProp(name = "id")
    override fun setId(layer: RNMBXRasterParticleLayer, id: Dynamic) {
        layer.iD = id.asString()
    }

    @ReactProp(name = "existing")
    override fun setExisting(layer: RNMBXRasterParticleLayer, existing: Dynamic) {
        layer.setExisting(existing.asBoolean())
    }

    @ReactProp(name = "sourceID")
    override fun setSourceID(layer: RNMBXRasterParticleLayer, sourceID: Dynamic) {
        layer.setSourceID(sourceID.asString())
    }

    @ReactProp(name = "aboveLayerID")
    override fun setAboveLayerID(layer: RNMBXRasterParticleLayer, aboveLayerID: Dynamic) {
        layer.setAboveLayerID(aboveLayerID.asString())
    }

    @ReactProp(name = "belowLayerID")
    override fun setBelowLayerID(layer: RNMBXRasterParticleLayer, belowLayerID: Dynamic) {
        layer.setBelowLayerID(belowLayerID.asString())
    }

    @ReactProp(name = "layerIndex")
    override fun setLayerIndex(layer: RNMBXRasterParticleLayer, layerIndex: Dynamic) {
        layer.setLayerIndex(layerIndex.asInt())
    }

    @ReactProp(name = "minZoomLevel")
    override fun setMinZoomLevel(layer: RNMBXRasterParticleLayer, minZoomLevel: Dynamic) {
        layer.setMinZoomLevel(minZoomLevel.asDouble())
    }

    @ReactProp(name = "maxZoomLevel")
    override fun setMaxZoomLevel(layer: RNMBXRasterParticleLayer, maxZoomLevel: Dynamic) {
        layer.setMaxZoomLevel(maxZoomLevel.asDouble())
    }

    @ReactProp(name = "reactStyle")
    override fun setReactStyle(layer: RNMBXRasterParticleLayer, style: Dynamic) {
        layer.setReactStyle(style.asMap())
    }

    @ReactProp(name = "sourceLayerID")
    override fun setSourceLayerID(layer: RNMBXRasterParticleLayer, sourceLayerID: Dynamic) {
        layer.setSourceLayerID(sourceLayerID.asString())
    }

    @ReactProp(name = "filter")
    override fun setFilter(layer: RNMBXRasterParticleLayer, filterList: Dynamic) {
        layer.setFilter(filterList.asArray())
    }

    @ReactProp(name = "slot")
    override fun setSlot(layer: RNMBXRasterParticleLayer, slot: Dynamic) {
        layer.setSlot(slot.asString())
    }
    // @{codepart-replace-end}

    companion object {
        const val REACT_CLASS = "RNMBXRasterParticleLayer"
        const val isImplemented = true
    }
}
