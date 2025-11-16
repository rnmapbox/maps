package com.rnmapbox.rnmbx.components.styles.layers

import android.content.Context
import com.mapbox.maps.MapboxExperimental
import com.mapbox.maps.extension.style.layers.generated.RasterParticleLayer
import com.rnmapbox.rnmbx.components.styles.RNMBXStyle
import com.rnmapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXRasterParticleLayer(context: Context?) : RNMBXLayer<RasterParticleLayer?>(
    context!!
) {
    var mSourceLayerID: String? = null

    override fun makeLayer(): RasterParticleLayer {
        val result = RasterParticleLayer(iD!!, mSourceID!!)
        mSourceLayerID?.let {
            result.sourceLayer(it)
        }
        return result
    }

    override fun addStyles() {
        mLayer?.also {
            RNMBXStyleFactory.setRasterParticleLayerStyle(it, RNMBXStyle(context, mReactStyle, mMap!!))
        } ?: run {
            Logger.e("RNMBXRasterParticleLayer", "mLayer is null")
        }
    }

    @OptIn(MapboxExperimental::class)
    fun setSourceLayerID(sourceLayer: String?) {
        mSourceLayerID = sourceLayer
        mLayer?.let {
            it.sourceLayer(sourceLayer!!)
        }
    }
}
