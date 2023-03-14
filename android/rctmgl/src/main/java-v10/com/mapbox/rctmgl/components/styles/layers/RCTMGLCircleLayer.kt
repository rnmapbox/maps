package com.mapbox.rctmgl.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.layers.generated.CircleLayer
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.components.styles.RCTMGLStyle
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory

class RCTMGLCircleLayer(context: Context?) : RCTLayer<CircleLayer?>(
    context!!
) {
    private var mSourceLayerID: String? = null
    override fun updateFilter(expression: Expression?) {
        mLayer!!.filter(expression!!)
    }

    override fun addToMap(mapView: RCTMGLMapView) {
        super.addToMap(mapView)
    }

    override fun makeLayer(): CircleLayer {
        val layer = CircleLayer(iD!!, mSourceID!!)
        if (mSourceLayerID != null) {
            layer.sourceLayer(mSourceLayerID!!)
        }
        return layer
    }

    override fun addStyles() {
        RCTMGLStyleFactory.setCircleLayerStyle(mLayer, RCTMGLStyle(context, mReactStyle, mMap!!))
    }

    fun setSourceLayerID(sourceLayerID: String?) {
        mSourceLayerID = sourceLayerID
        if (mLayer != null) {
            mLayer!!.sourceLayer(sourceLayerID!!)
        }
    }
}