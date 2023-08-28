package com.mapbox.rctmgl.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.layers.generated.RasterLayer
import com.mapbox.rctmgl.components.styles.RCTMGLStyle
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory

class RCTMGLRasterLayer(context: Context?) : RCTLayer<RasterLayer?>(
    context!!
) {
    override fun makeLayer(): RasterLayer {
        return RasterLayer(iD!!, mSourceID!!)
    }

    override fun addStyles() {
        RCTMGLStyleFactory.setRasterLayerStyle(mLayer, RCTMGLStyle(context, mReactStyle, mMap!!))
    }
}