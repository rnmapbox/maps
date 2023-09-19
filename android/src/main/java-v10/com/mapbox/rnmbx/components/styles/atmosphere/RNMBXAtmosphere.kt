package com.mapbox.rnmbx.components.styles.atmosphere

import android.content.Context
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.extension.style.atmosphere.generated.Atmosphere
import com.mapbox.maps.extension.style.terrain.generated.Terrain
import com.mapbox.maps.extension.style.terrain.generated.removeTerrain
import com.mapbox.rnmbx.components.RemovalReason
import com.mapbox.rnmbx.components.mapview.RNMBXMapView
import com.mapbox.rnmbx.components.styles.RNMBXStyle
import com.mapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.mapbox.rnmbx.components.styles.sources.AbstractSourceConsumer
import com.mapbox.rnmbx.utils.Logger

class RNMBXAtmosphere(context: Context?) : AbstractSourceConsumer(context) {
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

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        mMap = mapView.getMapboxMap()
        val atmosphere = makeAtmosphere()
        mAtmosphere = atmosphere
        addStyles()
        mapView.savedStyle?.let { atmosphere.bindTo(it) }
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        mapView.savedStyle?.let { it.removeTerrain() }
        mMap = null
        return super.removeFromMap(mapView, reason)
    }

    fun makeAtmosphere(): Atmosphere {
        return Atmosphere()
    }

    fun addStyles() {
        mAtmosphere?.also {
            RNMBXStyleFactory.setAtmosphereLayerStyle(
                it, RNMBXStyle(
                    context, mReactStyle!!,
                    mMap!!
                )
            )
        } ?: run {
            Logger.e("RNMBXAtmosphere", "mAtmosphere is null")
        }
    }
}