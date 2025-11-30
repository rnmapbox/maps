package com.rnmapbox.rnmbx.components.styles.layers

import android.content.Context
import android.view.ViewGroup

/**
 * Dummy implementation of RNMBXRasterParticleLayer for v10 compatibility.
 * This class extends ViewGroup directly (instead of RNMBXLayer) to avoid
 * inheriting from Layer which has internal abstract methods in v10.
 * This class should never be instantiated in v10 builds.
 */
class RNMBXRasterParticleLayer(context: Context) : ViewGroup(context) {
    var mSourceLayerID: String? = null

    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
        // Stub - never called
    }

    fun setSourceLayerID(sourceLayer: String?) {
        mSourceLayerID = sourceLayer
    }
}
