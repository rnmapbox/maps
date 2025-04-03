package com.rnmapbox.rnmbx.components.styles.sources

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXRasterSourceManagerInterface
import com.rnmapbox.rnmbx.events.constants.EventKeys
import com.rnmapbox.rnmbx.events.constants.eventMapOf
import javax.annotation.Nonnull
import com.facebook.react.bridge.ReadableType
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXRasterSourceManager(reactApplicationContext: ReactApplicationContext) :
    RNMBXTileSourceManager<RNMBXRasterSource>(reactApplicationContext),
    RNMBXRasterSourceManagerInterface<RNMBXRasterSource> {
    @Nonnull
    override fun getName(): String {
        return REACT_CLASS
    }

    @Nonnull
    override fun createViewInstance(@Nonnull reactContext: ThemedReactContext): RNMBXRasterSource {
        return RNMBXRasterSource(reactContext)
    }

    @ReactProp(name = "tileSize")
    override fun setTileSize(source: RNMBXRasterSource, tileSize: Dynamic) {
        source.setTileSize(tileSize.asInt())
    }

    override fun customEvents(): Map<String, String>? {
        return eventMapOf(
            EventKeys.RASTER_SOURCE_LAYER_CLICK to "onMapboxRasterSourcePress",
            EventKeys.MAP_ANDROID_CALLBACK to "onAndroidCallback"
        )
    }

    companion object {
        const val REACT_CLASS = "RNMBXRasterSource"
    }

    @ReactProp(name = "existing")
    override fun setExisting(source: RNMBXRasterSource, value: Dynamic) {
        source.mExisting = value.asBoolean()
    }

    @ReactProp(name = "sourceBounds")
    override fun setSourceBounds(source: RNMBXRasterSource, value: Dynamic) {
        if (value.type != ReadableType.Array || value.asArray().size() != 4) {
           Logger.e(REACT_CLASS, "source bounds must be an array with left, bottom, top, and right values")
           return
        }
        val bboxArray = Array(4) { i -> value.asArray().getDouble(i) }

        if(!this.validateBbox(bboxArray)){
            Logger.e(REACT_CLASS, "source bounds contain invalid bbox")
            return
        }

        source.setSourceBounds(bboxArray)
    }

    private fun validateBbox(bbox: Array<Double>): Boolean {
        if (bbox.size != 4) return false

        val (swLng, swLat, neLng, neLat) = bbox

        val isLngValid = swLng in -180.0..180.0 && neLng in -180.0..180.0
        val isLatValid = swLat in -90.0..90.0 && neLat in -90.0..90.0
        val isSouthWestOfNorthEast = swLng < neLng && swLat < neLat

        return isLngValid && isLatValid && isSouthWestOfNorthEast
    }
}
