package com.mapbox.rnmbx.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.layers.generated.BackgroundLayer
import com.mapbox.rnmbx.components.styles.RNMBXStyle
import com.mapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.mapbox.rnmbx.utils.Logger

class RNMBXBackgroundLayer(context: Context?) : RCTLayer<BackgroundLayer?>(
    context!!
) {
    override fun makeLayer(): BackgroundLayer {
        return BackgroundLayer(iD!!)
    }

    override fun addStyles() {
        mLayer?.also {
            RNMBXStyleFactory.setBackgroundLayerStyle(
                it,
                RNMBXStyle(context, mReactStyle, mMap!!)
            )
        } ?: run {
            Logger.e("RNMBXBackgroundLayer", "mLayer is null")
        }
    }
}