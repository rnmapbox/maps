package com.rnmapbox.rnmbx.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.layers.generated.RasterLayer
import com.rnmapbox.rnmbx.components.styles.RNMBXStyle
import com.rnmapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXRasterLayer(context: Context?) : RNMBXLayer<RasterLayer?>(
    context!!
) {
    override fun makeLayer(): RasterLayer {
        return RasterLayer(iD!!, mSourceID!!)
    }

    override fun addStyles() {
        mLayer?.also {
            RNMBXStyleFactory.setRasterLayerStyle(it, RNMBXStyle(context, mReactStyle, mMap!!))
        } ?: run {
            Logger.e("RNMBXRasterLayer", "mLayer is null")
        }
    }

    fun setSourceLayerID(asString: String?) {
        // no-op
    }
}