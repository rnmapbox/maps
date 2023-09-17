package com.mapbox.rctmgl.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.layers.generated.SkyLayer
import com.mapbox.rctmgl.components.styles.layers.RCTLayer
import com.mapbox.rctmgl.utils.Logger.e
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory
import com.mapbox.rctmgl.components.styles.RCTMGLStyle
import com.mapbox.rctmgl.utils.Logger

class RCTMGLSkyLayer(context: Context?) : RCTLayer<SkyLayer?>(
    context!!
) {
    private val mSourceLayerID: String? = null
    override fun updateFilter(expression: Expression?) {
        mLayer!!.filter(expression!!)
    }

    override fun addToMap(mapView: RCTMGLMapView) {
        super.addToMap(mapView)
    }

    override fun makeLayer(): SkyLayer {
        return SkyLayer(iD!!)
    }

    override fun addStyles() {
        mLayer?.also {
            RCTMGLStyleFactory.setSkyLayerStyle(
                it,
                RCTMGLStyle(context, mReactStyle, mMap!!)
            )
        } ?: run {
            Logger.e("RCTMGLSkyLayer", "mLayer is null")
        }
    }

    fun setSourceLayerID(sourceLayerID: String?) {
        e("RCTMGLSkyLayer", "Source layer should not be set for source layer id")
    }
}