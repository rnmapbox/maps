package com.mapbox.rctmgl.components.styles.atmosphere

import android.content.Context
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.extension.style.atmosphere.generated.Atmosphere
import com.mapbox.maps.extension.style.terrain.generated.Terrain
import com.mapbox.maps.extension.style.terrain.generated.removeTerrain
import com.mapbox.rctmgl.components.RemovalReason
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.components.styles.RCTMGLStyle
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory
import com.mapbox.rctmgl.components.styles.sources.AbstractSourceConsumer
import com.mapbox.rctmgl.utils.Logger

class RCTMGLAtmosphere(context: Context?) : AbstractSourceConsumer(context) {
    override var iD: String? = null
    protected var mAtmosphere: Atmosphere? = null

    // beginregion RCTLayer
    @JvmField
    protected var mMap: MapboxMap? = null

    @JvmField
    protected var mReactStyle: ReadableMap? = null

    fun setReactStyle(reactStyle: ReadableMap?) {
        mReactStyle = reactStyle
        if (mAtmosphere != null) {
            addStyles()
        }
    }
    // endregion RCTLayer

    override fun addToMap(mapView: RCTMGLMapView) {
        super.addToMap(mapView)
        mMap = mapView.getMapboxMap()
        val atmosphere = makeAtmosphere()
        mAtmosphere = atmosphere
        addStyles()
        mapView.savedStyle?.let { atmosphere.bindTo(it) }
    }

    override fun removeFromMap(mapView: RCTMGLMapView, reason: RemovalReason): Boolean {
        mapView.savedStyle?.let { it.removeTerrain() }
        mMap = null
        return super.removeFromMap(mapView, reason)
    }

    fun makeAtmosphere(): Atmosphere {
        return Atmosphere()
    }

    fun addStyles() {
        mAtmosphere?.also {
            RCTMGLStyleFactory.setAtmosphereLayerStyle(
                it, RCTMGLStyle(
                    context, mReactStyle!!,
                    mMap!!
                )
            )
        } ?: run {
            Logger.e("RCTMGLAtmosphere", "mAtmosphere is null")
        }
    }
}