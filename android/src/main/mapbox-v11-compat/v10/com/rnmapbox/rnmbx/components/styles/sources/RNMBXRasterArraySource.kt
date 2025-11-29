package com.rnmapbox.rnmbx.components.styles.sources

import android.content.Context
import android.view.ViewGroup

/**
 * Dummy implementation of RNMBXRasterArraySource for v10 compatibility.
 * This class extends ViewGroup directly (instead of RNMBXTileSource) to avoid
 * inheriting from Source which has internal abstract methods in v10.
 * This class should never be instantiated in v10 builds.
 */
class RNMBXRasterArraySource(context: Context) : ViewGroup(context) {
    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
        // Stub - never called
    }
}
