package com.rnmapbox.rnmbx.components.styles.sources

import android.content.Context
import com.mapbox.maps.extension.style.sources.generated.RasterArraySource

// Dummy class for v10 compatibility - never instantiated
class RNMBXRasterArraySource(context: Context?) : RNMBXTileSource<RasterArraySource?>(context) {
    override fun makeSource(): RasterArraySource {
        throw UnsupportedOperationException("RasterArraySource is only supported in Mapbox v11+")
    }

    override fun hasPressListener(): Boolean = false

    override fun onPress(feature: OnPressEvent?) {}

    override fun hasNoDataSoRefersToExisting(): Boolean = false
}
