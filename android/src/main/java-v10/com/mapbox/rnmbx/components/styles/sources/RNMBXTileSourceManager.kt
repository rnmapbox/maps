package com.mapbox.rnmbx.components.styles.sources

import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableType
import com.facebook.react.uimanager.annotations.ReactProp
import com.mapbox.rnmbx.components.AbstractEventEmitter

abstract class RNMBXTileSourceManager<T : RNMBXTileSource<*>?> internal constructor(
    reactApplicationContext: ReactApplicationContext
) : AbstractEventEmitter<T>(reactApplicationContext) {
    override fun getChildAt(source: T, childPosition: Int): View {
        return source!!.getChildAt(childPosition)
    }

    override fun getChildCount(source: T): Int {
        return source!!.childCount
    }

    override fun addView(source: T, childView: View, childPosition: Int) {
        source!!.addLayer(childView, childPosition)
    }

    override fun removeViewAt(source: T, childPosition: Int) {
        source!!.removeLayer(childPosition)
    }

    @ReactProp(name = "id")
    fun setID(source: T, id: String?) {
        source!!.iD = id
    }

    @ReactProp(name = "url")
    fun setURL(source: T, url: String?) {
        source!!.uRL = url
    }

    @ReactProp(name = "tileUrlTemplates")
    fun setTileUrlTemplates(source: T, tileUrlTemplates: ReadableArray) {
        val urls: MutableList<String> = ArrayList()
        for (i in 0 until tileUrlTemplates.size()) {
            if (tileUrlTemplates.getType(0) == ReadableType.String) {
                urls.add(tileUrlTemplates.getString(i))
            }
        }
        source!!.tileUrlTemplates = urls
    }

    @ReactProp(name = "attribution")
    fun setAttribution(source: T, attribution: String?) {
        source!!.attribution = attribution
    }

    @ReactProp(name = "minZoomLevel")
    fun setMinZoomLevel(source: T, minZoomLevel: Int) {
        source!!.minZoomLevel = minZoomLevel
    }

    @ReactProp(name = "maxZoomLevel")
    fun setMaxZoomLevel(source: T, maxZoomLevel: Int) {
        source!!.maxZoomLevel = maxZoomLevel
    }

    @ReactProp(name = "tms")
    fun setTMS(source: T, tms: Boolean) {
        source!!.tMS = tms
    }
}