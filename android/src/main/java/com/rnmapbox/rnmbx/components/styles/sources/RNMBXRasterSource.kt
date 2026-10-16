package com.rnmapbox.rnmbx.components.styles.sources

import android.content.Context
import com.mapbox.maps.extension.style.sources.generated.RasterSource

class RNMBXRasterSource(context: Context?) : RNMBXTileSource<RasterSource?>(context) {
    private var mTileSize: Int? = null
    private var mPrefetchZoomDelta: Long? = null
    private var mTileNetworkRequestsDelay: Double? = null
    override fun makeSource(): RasterSource {
        val id = iD!!
        val configurationUrl = uRL
        val tileSize = if (mTileSize == null) DEFAULT_TILE_SIZE else mTileSize!!
        val builder = if (configurationUrl != null) {
            RasterSource.Builder(id).url(configurationUrl)
        } else {
            RasterSource.Builder(id).tileSet(buildTileset())
        }
        builder.tileSize(tileSize.toLong())
        mPrefetchZoomDelta?.let { builder.prefetchZoomDelta(it) }
        mTileNetworkRequestsDelay?.let { builder.tileNetworkRequestsDelay(it) }
        return builder.build()
    }

    fun setTileSize(tileSize: Int) {
        mTileSize = tileSize
    }

    fun setPrefetchZoomDelta(value: Long) {
        mPrefetchZoomDelta = value
    }

    fun setTileNetworkRequestsDelay(value: Double) {
        mTileNetworkRequestsDelay = value
    }

    override fun hasPressListener(): Boolean {
        return false
    }

    override fun onPress(feature: OnPressEvent?) {
        // ignore, cannot query raster layers
    }

    override fun hasNoDataSoRefersToExisting(): Boolean {
        return uRL == null && tileUrlTemplates.isEmpty()
    }

    companion object {
        const val DEFAULT_TILE_SIZE = 512
    }

    fun setSourceBounds(value: Array<Double>) {
        bounds = value
    }
}
