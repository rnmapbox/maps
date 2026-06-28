package com.rnmapbox.rnmbx.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.layers.generated.HillshadeLayer
import com.rnmapbox.rnmbx.components.styles.RNMBXStyle
import com.rnmapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXHillshadeLayer(context: Context?) : RNMBXLayer<HillshadeLayer?>(
    context!!
) {
    override fun makeLayer(): HillshadeLayer {
        return HillshadeLayer(iD!!, mSourceID!!)
    }

    override fun addStyles() {
        mLayer?.also {
            RNMBXStyleFactory.setHillshadeLayerStyle(it, RNMBXStyle(context, mReactStyle, mMap!!))
        } ?: run {
            Logger.e("RNMBXHillshadeLayer", "mLayer is null")
        }
    }

    fun setSourceLayerID(asString: String?) {
        // no-op
    }
}
