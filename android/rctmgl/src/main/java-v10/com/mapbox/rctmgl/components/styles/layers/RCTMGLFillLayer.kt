package com.mapbox.rctmgl.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.layers.generated.FillLayer
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.components.styles.RCTMGLStyle
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory

class RCTMGLFillLayer(context: Context?) : RCTLayer<FillLayer?>(
    context!!
) {
    private var mSourceLayerID: String? = null
    override fun updateFilter(expression: Expression?) {
        mLayer!!.filter(expression!!)
    }

    override fun addToMap(mapView: RCTMGLMapView) {
        super.addToMap(mapView)
    }

    override fun makeLayer(): FillLayer {
        val layer = FillLayer(iD!!, mSourceID!!)
        if (mSourceLayerID != null) {
            layer.sourceLayer(mSourceLayerID!!)
        }
        return layer
    }

    override fun addStyles() {
        RCTMGLStyleFactory.setFillLayerStyle(mLayer, RCTMGLStyle(context, mReactStyle, mMap!!))
    }

    fun setSourceLayerID(sourceLayerID: String?) {
        mSourceLayerID = sourceLayerID
        if (mLayer != null) {
            mLayer!!.sourceLayer(mSourceLayerID!!)
        }
    }
}