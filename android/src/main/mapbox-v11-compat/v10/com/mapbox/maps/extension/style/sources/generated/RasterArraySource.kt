// Dummy RasterArraySource for v10 compatibility
// RasterArraySource is only available in Mapbox SDK v11+
package com.mapbox.maps.extension.style.sources.generated

/**
 * Dummy implementation of RasterArraySource for v10 compatibility.
 * This class should never be instantiated in v10 builds.
 * Note: Does not extend Source to avoid abstract method issues in v10.
 */
class RasterArraySource private constructor(
    builder: Builder
) {
    val sourceId: String = builder.sourceId

    class Builder(val sourceId: String) {
        fun url(url: String): Builder = this
        fun tileSize(tileSize: Long): Builder = this
        fun build(): RasterArraySource = RasterArraySource(this)
    }
}
