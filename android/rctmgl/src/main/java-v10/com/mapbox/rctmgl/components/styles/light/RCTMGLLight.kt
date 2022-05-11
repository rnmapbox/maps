package com.mapbox.rctmgl.components.styles.light

import android.content.Context
import com.mapbox.maps.extension.style.light.generated.setLight
import com.mapbox.rctmgl.components.AbstractMapFeature
import com.mapbox.maps.MapboxMap
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.Style
import com.mapbox.maps.extension.style.light.generated.Light
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory
import com.mapbox.rctmgl.components.styles.RCTMGLStyle

class RCTMGLLight(context: Context?) : AbstractMapFeature(context) {
    private var mMap: MapboxMap? = null
    private var mReactStyle: ReadableMap? = null
    override fun addToMap(mapView: RCTMGLMapView) {
        mMap = mapView.getMapboxMap()
        setLight()
    }

    override fun removeFromMap(mapView: RCTMGLMapView) {
        // ignore there's nothing to remove just update the light style
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
            val light = Light()
            setLight(light)
        }
    }

    private val style: Style?
        private get() = if (mMap == null) {
            null
        } else mMap!!.getStyle()
}