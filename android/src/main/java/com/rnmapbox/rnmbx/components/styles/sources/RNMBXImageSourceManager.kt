package com.rnmapbox.rnmbx.components.styles.sources

import android.view.View
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.rnmapbox.rnmbx.utils.GeoJSONUtils.toLatLngQuad

class RNMBXImageSourceManager : ViewGroupManager<RNMBXImageSource>() {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXImageSource {
        return RNMBXImageSource(reactContext)
    }

    override fun getChildAt(source: RNMBXImageSource, childPosition: Int): View {
        return source.getChildAt(childPosition)
    }

    override fun getChildCount(source: RNMBXImageSource): Int {
        return source.childCount
    }

    override fun addView(source: RNMBXImageSource, childView: View, childPosition: Int) {
        source.addLayer(childView, childPosition)
    }

    override fun removeViewAt(source: RNMBXImageSource, childPosition: Int) {
        source.removeLayer(childPosition)
    }

    @ReactProp(name = "id")
    fun setId(source: RNMBXImageSource, id: String?) {
        source.iD = id
    }

    @ReactProp(name = "url")
    fun setUrl(source: RNMBXImageSource, url: String?) {
        source.setURL(url)
    }

    @ReactProp(name = "coordinates")
    fun setCoordinates(source: RNMBXImageSource, arr: ReadableArray?) {
        val quad = toLatLngQuad(arr) ?: return
        source.setCoordinates(quad)
    }

    companion object {
        const val REACT_CLASS = "RNMBXImageSource"
    }
}