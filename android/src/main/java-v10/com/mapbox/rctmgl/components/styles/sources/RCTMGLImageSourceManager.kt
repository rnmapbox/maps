package com.mapbox.rctmgl.components.styles.sources

import android.view.View
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.mapbox.rctmgl.utils.GeoJSONUtils.toLatLngQuad

class RCTMGLImageSourceManager : ViewGroupManager<RCTMGLImageSource>() {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLImageSource {
        return RCTMGLImageSource(reactContext)
    }

    override fun getChildAt(source: RCTMGLImageSource, childPosition: Int): View {
        return source.getChildAt(childPosition)
    }

    override fun getChildCount(source: RCTMGLImageSource): Int {
        return source.childCount
    }

    override fun addView(source: RCTMGLImageSource, childView: View, childPosition: Int) {
        source.addLayer(childView, childPosition)
    }

    override fun removeViewAt(source: RCTMGLImageSource, childPosition: Int) {
        source.removeLayer(childPosition)
    }

    @ReactProp(name = "id")
    fun setId(source: RCTMGLImageSource, id: String?) {
        source.iD = id
    }

    @ReactProp(name = "url")
    fun setUrl(source: RCTMGLImageSource, url: String?) {
        source.setURL(url)
    }

    @ReactProp(name = "coordinates")
    fun setCoordinates(source: RCTMGLImageSource, arr: ReadableArray?) {
        val quad = toLatLngQuad(arr) ?: return
        source.setCoordinates(quad)
    }

    companion object {
        const val REACT_CLASS = "RCTMGLImageSource"
    }
}