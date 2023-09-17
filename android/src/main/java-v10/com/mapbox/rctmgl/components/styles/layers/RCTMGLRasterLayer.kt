package com.mapbox.rctmgl.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.layers.generated.RasterLayer
import com.mapbox.rctmgl.components.styles.RCTMGLStyle
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory
import com.mapbox.rctmgl.utils.Logger

class RCTMGLRasterLayer(context: Context?) : RCTLayer<RasterLayer?>(
    context!!
) {
    override fun makeLayer(): RasterLayer {
        return RasterLayer(iD!!, mSourceID!!)
    }

    override fun addStyles() {
        mLayer?.also {
            RCTMGLStyleFactory.setRasterLayerStyle(it, RCTMGLStyle(context, mReactStyle, mMap!!))
        } ?: run {
            Logger.e("RCTMGLRasterLayer", "mLayer is null")
        }
    }
}