package com.rnmapbox.rnmbx.components.styles.sources

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXRasterArraySourceManagerInterface
import com.rnmapbox.rnmbx.events.constants.EventKeys
import com.rnmapbox.rnmbx.events.constants.eventMapOf
import javax.annotation.Nonnull
import com.facebook.react.bridge.ReadableType
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXRasterArraySourceManager(reactApplicationContext: ReactApplicationContext) :
    RNMBXTileSourceManager<RNMBXRasterArraySource>(reactApplicationContext),
    RNMBXRasterArraySourceManagerInterface<RNMBXRasterArraySource> {
    @Nonnull
    override fun getName(): String {
        return REACT_CLASS
    }

    @Nonnull
    override fun createViewInstance(@Nonnull reactContext: ThemedReactContext): RNMBXRasterArraySource {
        return RNMBXRasterArraySource(reactContext)
    }

    @ReactProp(name = "tileSize")
    override fun setTileSize(source: RNMBXRasterArraySource, tileSize: Dynamic) {
        source.setTileSize(tileSize.asInt())
    }

    override fun customEvents(): Map<String, String>? {
        return eventMapOf(
            EventKeys.MAP_ANDROID_CALLBACK to "onAndroidCallback"
        )
    }

    companion object {
        const val REACT_CLASS = "RNMBXRasterArraySource"
    }

    @ReactProp(name = "existing")
    override fun setExisting(source: RNMBXRasterArraySource, value: Dynamic) {
        source.mExisting = value.asBoolean()
    }

    @ReactProp(name = "sourceBounds")
    override fun setSourceBounds(source: RNMBXRasterArraySource, value: Dynamic) {
        val array = value.asArray()
        if (value.type != ReadableType.Array || array == null || array.size() != 4) {
           Logger.e(REACT_CLASS, "source bounds must be an array with left, bottom, top, and right values")
           return
        }
        val bboxArray = Array(4) { i -> array.getDouble(i) }

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
