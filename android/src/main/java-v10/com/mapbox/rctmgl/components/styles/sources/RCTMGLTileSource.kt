package com.mapbox.rctmgl.components.styles.sources

import android.accessibilityservice.GestureDescription
import android.content.Context
import com.mapbox.maps.extension.style.sources.Source
import com.mapbox.maps.extension.style.sources.TileSet
import com.mapbox.maps.extension.style.sources.generated.Scheme
import java.util.*

abstract class RCTMGLTileSource<T : Source?>(context: Context?) : RCTSource<T>(context) {
    var uRL: String? = null
    public var tileUrlTemplates: Collection<String> = ArrayList()
    var attribution: String? = null
    var minZoomLevel: Int? = null
    var maxZoomLevel: Int? = null
    var tMS = false
    fun buildTileset(): TileSet {
        val tileUrlTemplates =
            tileUrlTemplates.toTypedArray()

        val builder = TileSet.Builder(
            TILE_SPEC_VERSION,
            Arrays.asList<String>(*tileUrlTemplates.clone())
        )
        if (minZoomLevel != null) {
            builder.minZoom(minZoomLevel!!.toFloat().toInt())
        }
        if (maxZoomLevel != null) {
            builder.maxZoom(maxZoomLevel!!.toFloat().toInt())
        }
        if (tMS) {
            builder.scheme(Scheme.TMS)
        }
        val attribution = this.attribution
        if (attribution != null) {
            builder.attribution(attribution)
        }
        return builder.build()
    }

    companion object {
        const val TILE_SPEC_VERSION = "2.1.0"
    }
}