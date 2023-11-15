package com.rnmapbox.rnmbx.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.layers.generated.FillLayer
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.components.styles.RNMBXStyle
import com.rnmapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXFillLayer(context: Context?) : RNMBXLayer<FillLayer?>(
    context!!
) {
    private var mSourceLayerID: String? = null
    override fun updateFilter(expression: Expression?) {
        mLayer!!.filter(expression!!)
    }

    override fun addToMap(mapView: RNMBXMapView) {
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
        mLayer?.also {
            RNMBXStyleFactory.setFillLayerStyle(it, RNMBXStyle(context, mReactStyle, mMap!!))
        } ?: run {
            Logger.e("RNMBXStyleFactory", "mLayer is null")
        }

    }

    fun setSourceLayerID(sourceLayerID: String?) {
        mSourceLayerID = sourceLayerID
        if (mLayer != null) {
            mLayer!!.sourceLayer(mSourceLayerID!!)
        }
    }
}