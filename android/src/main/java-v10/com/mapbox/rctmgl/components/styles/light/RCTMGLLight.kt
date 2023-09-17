package com.mapbox.rctmgl.components.styles.light

import android.content.Context
import com.mapbox.rctmgl.components.AbstractMapFeature
import com.mapbox.maps.MapboxMap
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.Style
import com.mapbox.rctmgl.components.RemovalReason
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory
import com.mapbox.rctmgl.components.styles.RCTMGLStyle

import com.mapbox.rctmgl.v11compat.light.*

class RCTMGLLight(context: Context?) : AbstractMapFeature(context) {
    private var mMap: MapboxMap? = null
    private var mReactStyle: ReadableMap? = null
    override fun addToMap(mapView: RCTMGLMapView) {
        super.addToMap(mapView)
        mMap = mapView.getMapboxMap()
        setLight()
    }

    override fun removeFromMap(mapView: RCTMGLMapView, reason: RemovalReason): Boolean {
        // ignore there's nothing to remove just update the light style
        return super.removeFromMap(mapView, reason)
    }

    fun setReactStyle(reactStyle: ReadableMap?) {
        mReactStyle = reactStyle
        setLight()
    }

    private fun setLight(light: Light) {
        RCTMGLStyleFactory.setLightLayerStyle(light, RCTMGLStyle(context, mReactStyle!!, mMap!!))
        style!!.setLight(light)
    }

    private fun setLight() {
        if (style != null) {
            val light = createLight()
            setLight(light)
        }
    }

    private val style: Style?
        private get() = if (mMap == null) {
            null
        } else mMap!!.getStyle()
}