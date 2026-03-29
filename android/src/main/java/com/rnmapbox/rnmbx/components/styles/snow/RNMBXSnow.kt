package com.rnmapbox.rnmbx.components.styles.snow

import android.content.Context
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.extension.style.precipitations.generated.Snow
import com.mapbox.maps.extension.style.precipitations.generated.removeSnow
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.components.styles.RNMBXStyle
import com.rnmapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.rnmapbox.rnmbx.components.styles.sources.AbstractSourceConsumer
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXSnow(context: Context?) : AbstractSourceConsumer(context) {
    override var iD: String? = null
    protected var mSnow: Snow? = null

    // beginregion RNMBXLayer
    @JvmField
    protected var mMap: MapboxMap? = null

    @JvmField
    protected var mReactStyle: ReadableMap? = null

    fun setReactStyle(reactStyle: ReadableMap?) {
        mReactStyle = reactStyle
        if (mSnow != null) {
            addStyles()
        }
    }
    // endregion RNMBXLayer

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        mMap = mapView.getMapboxMap()
        val snow = makeSnow()
        mSnow = snow
        addStyles()
        mapView.savedStyle?.let { snow.bindTo(it) }
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        mapView.savedStyle?.let { it.removeSnow() }
        mSnow = null
        mMap = null
        return super.removeFromMap(mapView, reason)
    }

    fun makeSnow(): Snow {
        return Snow()
    }

    fun addStyles() {
        mSnow?.also {
            RNMBXStyleFactory.setSnowLayerStyle(
                it, RNMBXStyle(
                    context, mReactStyle,
                    mMap!!
                )
            )
        } ?: run {
            Logger.e("RNMBXSnow", "mSnow is null")
        }
    }
}
