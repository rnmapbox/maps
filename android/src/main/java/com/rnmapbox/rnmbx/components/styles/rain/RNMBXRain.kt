package com.rnmapbox.rnmbx.components.styles.rain

import android.content.Context
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.extension.style.precipitations.generated.Rain
import com.mapbox.maps.extension.style.precipitations.generated.removeRain
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
        mapView.savedStyle?.let { warnIfMeasureLightUnavailable(it) }
        val rain = makeRain()
        mRain = rain
        addStyles()
        mapView.savedStyle?.let { rain.bindTo(it) }
    }

    private fun warnIfMeasureLightUnavailable(style: com.mapbox.maps.Style) {
        val hasLights = style.getStyleLights().isNotEmpty()
        if (hasLights) return

        val affectedProps = listOf("color", "opacity", "vignetteColor")
        val missingProps = affectedProps.filter { mReactStyle?.hasKey(it) != true }
        if (missingProps.isEmpty()) return

        Logger.w(
            "RNMBXRain",
            "The current style has no 3D lights, so measure-light(\"brightness\") " +
                "expressions used in default rain ${missingProps.joinToString(", ")} will fail. " +
                "Use a Standard style or set explicit values for: ${missingProps.joinToString(", ")}"
        )
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
