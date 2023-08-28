package com.mapbox.rctmgl.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.layers.generated.SkyLayer
import com.mapbox.rctmgl.components.styles.layers.RCTLayer
import com.mapbox.rctmgl.utils.Logger.e
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory
import com.mapbox.rctmgl.components.styles.RCTMGLStyle

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
        RCTMGLStyleFactory.setSkyLayerStyle(mLayer, RCTMGLStyle(context, mReactStyle!!, mMap!!))
    }

    fun setSourceLayerID(sourceLayerID: String?) {
        e("RCTMGLSkyLayer", "Source layer should not be set for source layer id")
    }
}