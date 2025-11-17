package com.rnmapbox.rnmbx.components.styles.layers

import android.view.View
import com.facebook.react.bridge.Dynamic
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXRasterParticleLayerManagerInterface

class RNMBXRasterParticleLayerManager : ViewGroupManager<View>(),
    RNMBXRasterParticleLayerManagerInterface<View> {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): View {
        throw UnsupportedOperationException("RasterParticleLayer is only supported in Mapbox v11+")
    }

    @ReactProp(name = "id")
    override fun setId(layer: View, id: Dynamic) {}

    @ReactProp(name = "existing")
    override fun setExisting(layer: View, existing: Dynamic) {}

    @ReactProp(name = "sourceID")
    override fun setSourceID(layer: View, sourceID: Dynamic) {}

    @ReactProp(name = "aboveLayerID")
    override fun setAboveLayerID(layer: View, aboveLayerID: Dynamic) {}

    @ReactProp(name = "belowLayerID")
    override fun setBelowLayerID(layer: View, belowLayerID: Dynamic) {}

    @ReactProp(name = "layerIndex")
    override fun setLayerIndex(layer: View, layerIndex: Dynamic) {}

    @ReactProp(name = "minZoomLevel")
    override fun setMinZoomLevel(layer: View, minZoomLevel: Dynamic) {}

    @ReactProp(name = "maxZoomLevel")
    override fun setMaxZoomLevel(layer: View, maxZoomLevel: Dynamic) {}

    @ReactProp(name = "reactStyle")
    override fun setReactStyle(layer: View, style: Dynamic) {}

    @ReactProp(name = "sourceLayerID")
    override fun setSourceLayerID(layer: View, sourceLayerID: Dynamic) {}

    @ReactProp(name = "filter")
    override fun setFilter(layer: View, filterList: Dynamic) {}

    @ReactProp(name = "slot")
    override fun setSlot(layer: View, slot: Dynamic) {}

    companion object {
        const val REACT_CLASS = "RNMBXRasterParticleLayer"
        const val isImplemented = false
    }
}
