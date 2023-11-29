package com.rnmapbox.rnmbx.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.layers.generated.ModelLayer
import com.rnmapbox.rnmbx.components.styles.RNMBXStyle
import com.rnmapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXModelLayer(context: Context?) : RNMBXLayer<ModelLayer?>(
    context!!
) {
    private var mSourceLayerID: String? = null

    override fun makeLayer(): ModelLayer? {
        val layer = ModelLayer(iD!!, mSourceID!!)
        if (mSourceLayerID != null) {
            layer.sourceLayer(mSourceLayerID!!)
        }
        return layer
    }

    override fun addStyles() {
        mLayer?.also {
            RNMBXStyleFactory.setModelLayerStyle(it, RNMBXStyle(context, mReactStyle, mMap!!))
        } ?: run {
            Logger.e("RNMBXLineLayer", "mLayer is null")
        }
    }

    fun setSourceLayerID(value: String) {
        mSourceLayerID = value
    }
}