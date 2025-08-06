package com.rnmapbox.rnmbx.components.styles.sources

import android.view.View
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableType
import com.facebook.react.uimanager.annotations.ReactProp
import com.rnmapbox.rnmbx.components.AbstractEventEmitter
import com.rnmapbox.rnmbx.utils.Logger

abstract class RNMBXTileSourceManager<T : RNMBXTileSource<*>> internal constructor(
    reactApplicationContext: ReactApplicationContext
) : AbstractEventEmitter<T>(reactApplicationContext) {
    override fun getChildAt(source: T, childPosition: Int): View {
        return source.getChildAt(childPosition)
    }

    override fun getChildCount(source: T): Int {
        return source.childCount
    }

    override fun addView(source: T, childView: View, childPosition: Int) {
        source.addLayer(childView, childPosition)
    }

    override fun removeViewAt(source: T, childPosition: Int) {
        source.removeLayer(childPosition)
    }

    @ReactProp(name = "id")
    fun setId(source: T, id: Dynamic) {
        source.iD = id.asString()
    }

    @ReactProp(name = "url")
    fun setUrl(source: T, url: Dynamic) {
        source.uRL = url.asString()
    }

    @ReactProp(name = "tileUrlTemplates")
    fun setTileUrlTemplates(source: T, tileUrlTemplates: Dynamic) {
        val array = tileUrlTemplates.asArray()
        if (array == null) {
            Logger.e("RNMBXTileSourceManager", "tileUrlTemplates array is null")
            return
        }
        val urls: MutableList<String> = ArrayList()
        for (i in 0 until array.size()) {
            if (array.getType(i) == ReadableType.String) {
                array.getString(i)?.let { urls.add(it) } ?: Logger.d("RNMBXTileSource", "Skipping null URL template at index $i")
            }
        }
        source!!.tileUrlTemplates = urls
    }

    @ReactProp(name = "attribution")
    fun setAttribution(source: T, attribution: Dynamic) {
        source!!.attribution = attribution.asString()
    }

    @ReactProp(name = "minZoomLevel")
    fun setMinZoomLevel(source: T, minZoomLevel: Dynamic) {
        source!!.minZoomLevel = minZoomLevel.asInt()
    }

    @ReactProp(name = "maxZoomLevel")
    fun setMaxZoomLevel(source: T, maxZoomLevel: Dynamic) {
        source!!.maxZoomLevel = maxZoomLevel.asInt()
    }

    @ReactProp(name = "tms")
    fun setTms(source: T, tms: Dynamic) {
        source!!.tMS = tms.asBoolean()
    }
}