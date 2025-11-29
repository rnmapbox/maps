// Dummy RasterArraySource for v10 compatibility
// RasterArraySource is only available in Mapbox SDK v11+
package com.mapbox.maps.extension.style.sources.generated

import com.mapbox.maps.extension.style.sources.Source

/**
 * Dummy implementation of RasterArraySource for v10 compatibility.
 * This class should never be instantiated in v10 builds.
 */
class RasterArraySource private constructor(
    builder: Builder
) : Source(builder.sourceId) {

    class Builder(val sourceId: String) {
        fun url(url: String): Builder = this
        fun tileSize(tileSize: Long): Builder = this
        fun build(): RasterArraySource = RasterArraySource(this)
    }
}
