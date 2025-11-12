// Dummy RasterParticleLayer for v10 compatibility
// RasterParticleLayer is only available in Mapbox SDK v11+
package com.mapbox.maps.extension.style.layers.generated

import com.mapbox.maps.extension.style.layers.Layer

/**
 * Dummy implementation of RasterParticleLayer for v10 compatibility.
 * This class should never be instantiated in v10 builds.
 */
class RasterParticleLayer(id: String, sourceId: String) : Layer(id) {
    override fun getType(): String = "raster-particle"

    fun rasterParticleArrayBand(value: String) {}
    fun rasterParticleArrayBand(expression: com.mapbox.maps.extension.style.expressions.generated.Expression) {}
    fun rasterParticleCount(value: Long) {}
    fun rasterParticleCount(expression: com.mapbox.maps.extension.style.expressions.generated.Expression) {}
    fun rasterParticleColor(expression: com.mapbox.maps.extension.style.expressions.generated.Expression) {}
    fun rasterParticleMaxSpeed(value: Double) {}
    fun rasterParticleMaxSpeed(expression: com.mapbox.maps.extension.style.expressions.generated.Expression) {}
    fun rasterParticleSpeedFactor(value: Double) {}
    fun rasterParticleSpeedFactor(expression: com.mapbox.maps.extension.style.expressions.generated.Expression) {}
    fun rasterParticleSpeedFactorTransition(transition: com.mapbox.maps.extension.style.types.StyleTransition) {}
    fun rasterParticleFadeOpacityFactor(value: Double) {}
    fun rasterParticleFadeOpacityFactor(expression: com.mapbox.maps.extension.style.expressions.generated.Expression) {}
    fun rasterParticleFadeOpacityFactorTransition(transition: com.mapbox.maps.extension.style.types.StyleTransition) {}
    fun rasterParticleResetRateFactor(value: Double) {}
    fun rasterParticleResetRateFactor(expression: com.mapbox.maps.extension.style.expressions.generated.Expression) {}
    fun visibility(visibility: com.mapbox.maps.extension.style.layers.properties.generated.Visibility) {}
}
