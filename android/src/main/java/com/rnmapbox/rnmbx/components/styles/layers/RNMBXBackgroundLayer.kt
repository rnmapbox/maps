package com.rnmapbox.rnmbx.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.layers.generated.BackgroundLayer
import com.rnmapbox.rnmbx.components.styles.RNMBXStyle
import com.rnmapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXBackgroundLayer(context: Context?) : RNMBXLayer<BackgroundLayer?>(
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