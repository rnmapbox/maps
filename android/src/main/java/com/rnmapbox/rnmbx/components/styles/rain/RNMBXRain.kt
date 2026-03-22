package com.rnmapbox.rnmbx.components.styles.rain

import android.content.Context
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.extension.style.rain.generated.Rain
import com.mapbox.maps.extension.style.rain.generated.removeRain
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.components.styles.RNMBXStyle
import com.rnmapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.rnmapbox.rnmbx.components.styles.sources.AbstractSourceConsumer
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXRain(context: Context?) : AbstractSourceConsumer(context) {
    override var iD: String? = null
    protected var mRain: Rain? = null

    // beginregion RNMBXLayer
    @JvmField
    protected var mMap: MapboxMap? = null

    @JvmField
    protected var mReactStyle: ReadableMap? = null

    fun setReactStyle(reactStyle: ReadableMap?) {
        mReactStyle = reactStyle
        if (mRain != null) {
            addStyles()
        }
    }
    // endregion RNMBXLayer

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        mMap = mapView.getMapboxMap()
        val rain = makeRain()
        mRain = rain
        addStyles()
        mapView.savedStyle?.let { rain.bindTo(it) }
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        mapView.savedStyle?.let { it.removeRain() }
        mRain = null
        mMap = null
        return super.removeFromMap(mapView, reason)
    }

    fun makeRain(): Rain {
        return Rain()
    }

    fun addStyles() {
        mRain?.also {
            RNMBXStyleFactory.setRainLayerStyle(
                it, RNMBXStyle(
                    context, mReactStyle,
                    mMap!!
                )
            )
        } ?: run {
            Logger.e("RNMBXRain", "mRain is null")
        }
    }
}
