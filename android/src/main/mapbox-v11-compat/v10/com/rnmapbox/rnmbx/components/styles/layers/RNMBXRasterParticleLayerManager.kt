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
        throw UnsupportedOperationException("RasterParticleLayer is only supported in Mapbox v11+")
    }

    @ReactProp(name = "id")
    override fun setId(layer: RNMBXRasterParticleLayer, id: Dynamic) {}

    @ReactProp(name = "existing")
    override fun setExisting(layer: RNMBXRasterParticleLayer, existing: Dynamic) {}

    @ReactProp(name = "sourceID")
    override fun setSourceID(layer: RNMBXRasterParticleLayer, sourceID: Dynamic) {}

    @ReactProp(name = "aboveLayerID")
    override fun setAboveLayerID(layer: RNMBXRasterParticleLayer, aboveLayerID: Dynamic) {}

    @ReactProp(name = "belowLayerID")
    override fun setBelowLayerID(layer: RNMBXRasterParticleLayer, belowLayerID: Dynamic) {}

    @ReactProp(name = "layerIndex")
    override fun setLayerIndex(layer: RNMBXRasterParticleLayer, layerIndex: Dynamic) {}

    @ReactProp(name = "minZoomLevel")
    override fun setMinZoomLevel(layer: RNMBXRasterParticleLayer, minZoomLevel: Dynamic) {}

    @ReactProp(name = "maxZoomLevel")
    override fun setMaxZoomLevel(layer: RNMBXRasterParticleLayer, maxZoomLevel: Dynamic) {}

    @ReactProp(name = "reactStyle")
    override fun setReactStyle(layer: RNMBXRasterParticleLayer, style: Dynamic) {}

    @ReactProp(name = "sourceLayerID")
    override fun setSourceLayerID(layer: RNMBXRasterParticleLayer, sourceLayerID: Dynamic) {}

    @ReactProp(name = "filter")
    override fun setFilter(layer: RNMBXRasterParticleLayer, filterList: Dynamic) {}

    @ReactProp(name = "slot")
    override fun setSlot(layer: RNMBXRasterParticleLayer, slot: Dynamic) {}

    companion object {
        const val REACT_CLASS = "RNMBXRasterParticleLayer"
        const val isImplemented = false
    }
}
