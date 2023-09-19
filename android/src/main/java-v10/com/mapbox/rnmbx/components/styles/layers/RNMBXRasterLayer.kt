package com.mapbox.rnmbx.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.layers.generated.RasterLayer
import com.mapbox.rnmbx.components.styles.RNMBXStyle
import com.mapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.mapbox.rnmbx.utils.Logger

class RNMBXRasterLayer(context: Context?) : RCTLayer<RasterLayer?>(
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
}