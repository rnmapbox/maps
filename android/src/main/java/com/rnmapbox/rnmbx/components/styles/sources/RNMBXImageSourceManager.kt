package com.rnmapbox.rnmbx.components.styles.sources

import android.view.View
import com.facebook.react.bridge.Dynamic
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXImageSourceManagerInterface
import com.rnmapbox.rnmbx.utils.GeoJSONUtils.toLatLngQuad

class RNMBXImageSourceManager : ViewGroupManager<RNMBXImageSource>(),
    RNMBXImageSourceManagerInterface<RNMBXImageSource> {
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
    override fun setId(source: RNMBXImageSource, id: Dynamic) {
        source.iD = id.asString()
    }

    @ReactProp(name = "url")
    override fun setUrl(source: RNMBXImageSource, url: Dynamic) {
        source.setURL(url.asString())
    }

    @ReactProp(name = "coordinates")
    override fun setCoordinates(source: RNMBXImageSource, arr: Dynamic) {
        val quad = toLatLngQuad(arr.asArray()) ?: return
        source.setCoordinates(quad)
    }

    @ReactProp(name = "existing")
    override fun setExisting(source: RNMBXImageSource, value: Dynamic) {
        source.mExisting = value.asBoolean()
    }

    companion object {
        const val REACT_CLASS = "RNMBXImageSource"
    }

}