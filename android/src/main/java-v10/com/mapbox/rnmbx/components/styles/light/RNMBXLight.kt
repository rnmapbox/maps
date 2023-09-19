package com.mapbox.rnmbx.components.styles.light

import android.content.Context
import com.mapbox.rnmbx.components.AbstractMapFeature
import com.mapbox.maps.MapboxMap
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.Style
import com.mapbox.rnmbx.components.RemovalReason
import com.mapbox.rnmbx.components.mapview.RNMBXMapView
import com.mapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.mapbox.rnmbx.components.styles.RNMBXStyle

import com.mapbox.rnmbx.v11compat.light.*

class RNMBXLight(context: Context?) : AbstractMapFeature(context) {
    private var mMap: MapboxMap? = null
    private var mReactStyle: ReadableMap? = null
    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        mMap = mapView.getMapboxMap()
        setLight()
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        // ignore there's nothing to remove just update the light style
        return super.removeFromMap(mapView, reason)
    }

    fun setReactStyle(reactStyle: ReadableMap?) {
        mReactStyle = reactStyle
        setLight()
    }

    private fun setLight(light: Light) {
        RNMBXStyleFactory.setLightLayerStyle(light, RNMBXStyle(context, mReactStyle!!, mMap!!))
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