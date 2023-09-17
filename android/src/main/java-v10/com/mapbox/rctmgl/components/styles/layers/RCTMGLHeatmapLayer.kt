package com.mapbox.rctmgl.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.layers.generated.HeatmapLayer
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.components.styles.RCTMGLStyle
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory
import com.mapbox.rctmgl.utils.Logger

class RCTMGLHeatmapLayer(context: Context?) : RCTLayer<HeatmapLayer?>(
    context!!
) {
    private var mSourceLayerID: String? = null
    override fun updateFilter(expression: Expression?) {
        mLayer!!.filter(expression!!)
    }

    override fun addToMap(mapView: RCTMGLMapView) {
        super.addToMap(mapView)
    }

    override fun makeLayer(): HeatmapLayer {
        val layer = HeatmapLayer(iD!!, mSourceID!!)
        if (mSourceLayerID != null) {
            layer.sourceLayer(mSourceLayerID!!)
        }
        return layer
    }

    override fun addStyles() {
        mLayer?.also {
            RCTMGLStyleFactory.setHeatmapLayerStyle(
                it,
                RCTMGLStyle(context, mReactStyle, mMap!!)
            )
        } ?: run {
            Logger.e("RCTMGLHeatmapLayer", "mLayer is null")
        }
    }

    fun setSourceLayerID(sourceLayerID: String?) {
        mSourceLayerID = sourceLayerID
        if (mLayer != null) {
            mLayer!!.sourceLayer(sourceLayerID!!)
        }
    }
}