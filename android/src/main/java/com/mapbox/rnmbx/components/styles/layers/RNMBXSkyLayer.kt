package com.mapbox.rnmbx.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.layers.generated.SkyLayer
import com.mapbox.rnmbx.components.styles.layers.RCTLayer
import com.mapbox.rnmbx.utils.Logger.e
import com.mapbox.rnmbx.components.mapview.RNMBXMapView
import com.mapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.mapbox.rnmbx.components.styles.RNMBXStyle
import com.mapbox.rnmbx.utils.Logger

class RNMBXSkyLayer(context: Context?) : RCTLayer<SkyLayer?>(
    context!!
) {
    private val mSourceLayerID: String? = null
    override fun updateFilter(expression: Expression?) {
        mLayer!!.filter(expression!!)
    }

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
    }

    override fun makeLayer(): SkyLayer {
        return SkyLayer(iD!!)
    }

    override fun addStyles() {
        mLayer?.also {
            RNMBXStyleFactory.setSkyLayerStyle(
                it,
                RNMBXStyle(context, mReactStyle, mMap!!)
            )
        } ?: run {
            Logger.e("RNMBXSkyLayer", "mLayer is null")
        }
    }

    fun setSourceLayerID(sourceLayerID: String?) {
        e("RNMBXSkyLayer", "Source layer should not be set for source layer id")
    }
}