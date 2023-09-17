package com.mapbox.rctmgl.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.layers.generated.BackgroundLayer
import com.mapbox.rctmgl.components.styles.RCTMGLStyle
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory
import com.mapbox.rctmgl.utils.Logger

class RCTMGLBackgroundLayer(context: Context?) : RCTLayer<BackgroundLayer?>(
    context!!
) {
    override fun makeLayer(): BackgroundLayer {
        return BackgroundLayer(iD!!)
    }

    override fun addStyles() {
        mLayer?.also {
            RCTMGLStyleFactory.setBackgroundLayerStyle(
                it,
                RCTMGLStyle(context, mReactStyle, mMap!!)
            )
        } ?: run {
            Logger.e("RCTMGLBackgroundLayer", "mLayer is null")
        }
    }
}