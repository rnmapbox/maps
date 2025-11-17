// Dummy RasterParticleLayer for v10 compatibility
// RasterParticleLayer is only available in Mapbox SDK v11+
package com.mapbox.maps.extension.style.layers.generated

import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.layers.Layer
import com.mapbox.maps.extension.style.layers.properties.generated.Visibility
import com.mapbox.maps.extension.style.types.StyleTransition

/**
 * Dummy implementation of RasterParticleLayer for v10 compatibility.
 * This class should never be instantiated in v10 builds.
 */
class RasterParticleLayer(private val id: String, private val sourceId: String) : Layer() {

    override val layerId: String
        get() = id

    override var minZoom: Double? = null
        private set

    override var maxZoom: Double? = null
        private set

    override var visibility: Visibility? = null
        private set

    override fun minZoom(minZoom: Double): Layer {
        this.minZoom = minZoom
        return this
    }

    override fun maxZoom(maxZoom: Double): Layer {
        this.maxZoom = maxZoom
        return this
    }

    internal override fun getType(): String = "raster-particle"

    fun rasterParticleArrayBand(value: String) {}
    fun rasterParticleArrayBand(expression: Expression) {}
    fun rasterParticleCount(value: Long) {}
    fun rasterParticleCount(expression: Expression) {}
    fun rasterParticleColor(expression: Expression) {}
    fun rasterParticleMaxSpeed(value: Double) {}
    fun rasterParticleMaxSpeed(expression: Expression) {}
    fun rasterParticleSpeedFactor(value: Double) {}
    fun rasterParticleSpeedFactor(expression: Expression) {}
    fun rasterParticleSpeedFactorTransition(transition: StyleTransition) {}
    fun rasterParticleFadeOpacityFactor(value: Double) {}
    fun rasterParticleFadeOpacityFactor(expression: Expression) {}
    fun rasterParticleFadeOpacityFactorTransition(transition: StyleTransition) {}
    fun rasterParticleResetRateFactor(value: Double) {}
    fun rasterParticleResetRateFactor(expression: Expression) {}
    fun visibility(visibility: Visibility) {
        this.visibility = visibility
    }
}
