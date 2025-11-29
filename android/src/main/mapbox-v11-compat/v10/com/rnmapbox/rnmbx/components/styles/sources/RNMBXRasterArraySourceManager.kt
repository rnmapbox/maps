package com.rnmapbox.rnmbx.components.styles.sources

import com.facebook.react.bridge.Dynamic
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXRasterArraySourceManagerInterface
import com.rnmapbox.rnmbx.events.constants.EventKeys
import com.rnmapbox.rnmbx.events.constants.eventMapOf
import javax.annotation.Nonnull

class RNMBXRasterArraySourceManager :
    ViewGroupManager<RNMBXRasterArraySource>(),
    RNMBXRasterArraySourceManagerInterface<RNMBXRasterArraySource> {
    @Nonnull
    override fun getName(): String {
        return REACT_CLASS
    }

    @Nonnull
    override fun createViewInstance(@Nonnull reactContext: ThemedReactContext): RNMBXRasterArraySource {
        throw UnsupportedOperationException("RasterArraySource is only supported in Mapbox v11+")
    }

    @ReactProp(name = "id")
    override fun setId(source: RNMBXRasterArraySource, id: Dynamic) {}

    @ReactProp(name = "url")
    override fun setUrl(source: RNMBXRasterArraySource, url: Dynamic) {}

    @ReactProp(name = "tileUrlTemplates")
    override fun setTileUrlTemplates(source: RNMBXRasterArraySource, tileUrlTemplates: Dynamic) {}

    @ReactProp(name = "tileSize")
    override fun setTileSize(source: RNMBXRasterArraySource, tileSize: Dynamic) {}

    @ReactProp(name = "minZoomLevel")
    override fun setMinZoomLevel(source: RNMBXRasterArraySource, minZoomLevel: Dynamic) {}

    @ReactProp(name = "maxZoomLevel")
    override fun setMaxZoomLevel(source: RNMBXRasterArraySource, maxZoomLevel: Dynamic) {}

    @ReactProp(name = "attribution")
    override fun setAttribution(source: RNMBXRasterArraySource, attribution: Dynamic) {}

    override fun customEvents(): Map<String, String>? {
        return eventMapOf(
            EventKeys.MAP_ANDROID_CALLBACK to "onAndroidCallback"
        )
    }

    companion object {
        const val REACT_CLASS = "RNMBXRasterArraySource"
        const val isImplemented = false
    }

    @ReactProp(name = "existing")
    override fun setExisting(source: RNMBXRasterArraySource, value: Dynamic) {}

    @ReactProp(name = "sourceBounds")
    override fun setSourceBounds(source: RNMBXRasterArraySource, value: Dynamic) {}
}
