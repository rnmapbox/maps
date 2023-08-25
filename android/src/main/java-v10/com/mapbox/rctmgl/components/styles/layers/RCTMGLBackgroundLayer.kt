package com.mapbox.rctmgl.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.layers.generated.BackgroundLayer
import com.mapbox.rctmgl.components.styles.RCTMGLStyle
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory

class RCTMGLBackgroundLayer(context: Context?) : RCTLayer<BackgroundLayer?>(
    context!!
) {
    override fun makeLayer(): BackgroundLayer {
        return BackgroundLayer(iD!!)
    }

    override fun addStyles() {
        RCTMGLStyleFactory.setBackgroundLayerStyle(
            mLayer,
            RCTMGLStyle(context, mReactStyle, mMap!!)
        )
    }
}