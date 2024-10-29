package com.rnmapbox.rnmbx.components.styles.sources

import android.content.Context
import com.mapbox.maps.extension.style.sources.generated.RasterSource

class RNMBXRasterSource(context: Context?) : RNMBXTileSource<RasterSource?>(context) {
    private var mTileSize: Int? = null
    override fun makeSource(): RasterSource {
        val id = iD!!
        val configurationUrl = uRL
        val tileSize = if (mTileSize == null) DEFAULT_TILE_SIZE else mTileSize!!
        return if (configurationUrl != null) {
            RasterSource.Builder(id).url(configurationUrl).tileSize(tileSize.toLong()).build()
        } else RasterSource.Builder(id).tileSet(buildTileset())
            .tileSize(tileSize.toLong()).build()
    }

    fun setTileSize(tileSize: Int) {
        mTileSize = tileSize
    }

    override fun hasPressListener(): Boolean {
        return false
    }

    override fun onPress(feature: OnPressEvent?) {
        // ignore, cannot query raster layers
    }

    override fun hasNoDataSoRefersToExisting(): Boolean {
        return uRL == null
    }

    companion object {
        const val DEFAULT_TILE_SIZE = 512
    }

    fun setSourceBounds(value: Array<Double>) {
        bounds = value
    }
}
