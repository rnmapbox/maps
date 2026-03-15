package com.rnmapbox.rnmbx.components.styles.atmosphere

import android.content.Context
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.extension.style.atmosphere.generated.Atmosphere
import com.mapbox.maps.extension.style.atmosphere.generated.removeAtmosphere
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.components.styles.RNMBXStyle
import com.rnmapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.rnmapbox.rnmbx.components.styles.sources.AbstractSourceConsumer
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXAtmosphere(context: Context?) : AbstractSourceConsumer(context) {
    override var iD: String? = null
    protected var mAtmosphere: Atmosphere? = null

    // beginregion RNMBXLayer
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
    // endregion RNMBXLayer

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        mMap = mapView.getMapboxMap()
        val atmosphere = makeAtmosphere()
        mAtmosphere = atmosphere
        addStyles()
        mapView.savedStyle?.let { atmosphere.bindTo(it) }
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        mapView.savedStyle?.let { it.removeAtmosphere() }
        mAtmosphere = null
        mMap = null
        return super.removeFromMap(mapView, reason)
    }

    fun makeAtmosphere(): Atmosphere {
        return Atmosphere()
    }

    fun addStyles() {
        val atmosphere = mAtmosphere ?: run {
            Logger.e("RNMBXAtmosphere", "mAtmosphere is null")
            return
        }
        val reactStyle = mReactStyle ?: return
        val map = mMap ?: return
        RNMBXStyleFactory.setAtmosphereLayerStyle(
            atmosphere, RNMBXStyle(context, reactStyle, map)
        )
    }
}