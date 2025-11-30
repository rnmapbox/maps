package com.rnmapbox.rnmbx.v11compat.stylefactory;

import com.mapbox.maps.extension.style.atmosphere.generated.Atmosphere
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.layers.generated.BackgroundLayer
import com.mapbox.maps.extension.style.layers.generated.CircleLayer
import com.mapbox.maps.extension.style.layers.generated.FillExtrusionLayer
import com.mapbox.maps.extension.style.layers.generated.FillLayer
import com.mapbox.maps.extension.style.layers.generated.LineLayer
import com.mapbox.maps.extension.style.layers.generated.ModelLayer
import com.mapbox.maps.extension.style.layers.generated.RasterLayer
import com.mapbox.maps.extension.style.layers.generated.SymbolLayer
import com.mapbox.maps.extension.style.types.StyleTransition

internal fun RasterLayer.rasterColor(rasterColor: Int) {
    this.rasterColor(Expression.color(rasterColor))
}

internal fun ModelLayer.modelOpacity(expression: Expression) {
    TODO("v11 only")
}

internal fun SymbolLayer.symbolZElevate(expression: Expression) {
    TODO("v11 only")
}

internal fun LineLayer.lineEmissiveStrengthTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun LineLayer.lineEmissiveStrength(expression: Expression) {
    TODO("v11 only")
}

internal fun Atmosphere.verticalRangeTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun FillLayer.fillEmissiveStrengthTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun FillLayer.fillEmissiveStrength(expression: Double) {
    TODO("v11 only")
}

internal fun FillLayer.fillEmissiveStrength(expression: Expression) {
    TODO("v11 only")
}

internal fun ModelLayer.modelHeightBasedEmissiveStrengthMultiplier(expression: Expression) {
    TODO("v11 only")
}

internal fun ModelLayer.modelCutoffFadeRange(value: Expression) {
    TODO("v11 only")
}

internal fun ModelLayer.modelCutoffFadeRange(value: Double) {
    TODO("v11 only")
}

internal fun BackgroundLayer.backgroundEmissiveStrengthTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun Atmosphere.verticalRange(value: Expression) {
    TODO("v11 only")
}

internal fun Atmosphere.verticalRange(value: kotlin.collections.List<Double>) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightIntensity(expression: Expression) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionAmbientOcclusionWallRadius(expression: Expression) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionRoundedRoof(value: Expression?) {
    TODO("v11 only")
}

internal fun SymbolLayer.iconImageCrossFade(expression: Expression) {
    TODO("v11 only")
}

internal fun SymbolLayer.textEmissiveStrengthTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun SymbolLayer.textEmissiveStrength(value: Double) {
    TODO("v11 only")
}

internal fun SymbolLayer.iconEmissiveStrength(expression: Expression) {
    TODO("v11 only")
}

internal fun SymbolLayer.symbolZElevate(expression: Boolean) {
    TODO("v11 only")
}

internal fun LineLayer.lineEmissiveStrength(value: Double) {
    TODO("v11 only")
}

internal fun BackgroundLayer.backgroundEmissiveStrength(expression: Double) {
    TODO("v11 only")
}

internal fun BackgroundLayer.backgroundEmissiveStrength(expression: Expression) {
    TODO("v11 only")
}

internal fun ModelLayer.modelHeightBasedEmissiveStrengthMultiplierTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun ModelLayer.modelHeightBasedEmissiveStrengthMultiplier(expression: List<Double>) {
    TODO("v11 only")
}

internal fun ModelLayer.modelRoughnessTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun ModelLayer.modelRoughness(expression: Double) {
    TODO("v11 only")
}

internal fun ModelLayer.modelRoughness(expression: Expression) {
    TODO("v11 only")
}

internal fun ModelLayer.modelEmissiveStrengthTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun ModelLayer.modelEmissiveStrength(expression: Double) {
    TODO("v11 only")
}

internal fun ModelLayer.modelEmissiveStrength(expression: Expression) {
    TODO("v11 only")
}

internal fun ModelLayer.modelAmbientOcclusionIntensityTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun ModelLayer.modelAmbientOcclusionIntensity(expression: Double) {
    TODO("v11 only")
}

internal fun ModelLayer.modelAmbientOcclusionIntensity(expression: Expression) {
    TODO("v11 only")
}

internal fun ModelLayer.modelReceiveShadows(expression: Boolean) {
    TODO("v11 only")
}

internal fun ModelLayer.modelReceiveShadows(expression: Expression) {
    TODO("v11 only")
}

internal fun ModelLayer.modelCastShadows(expression: Boolean) {
    TODO("v11 only")
}

internal fun ModelLayer.modelCastShadows(expression: Expression) {
    TODO("v11 only")
}

internal fun ModelLayer.modelColorMixIntensityTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun ModelLayer.modelColorMixIntensity(expression: Double) {
    TODO("v11 only")
}

internal fun ModelLayer.modelColorMixIntensity(expression: Expression) {
    TODO("v11 only")
}

internal fun ModelLayer.modelColorTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun ModelLayer.modelColor(expression: Int) {
    TODO("v11 only")
}

internal fun ModelLayer.modelColor(expression: Expression) {
    TODO("v11 only")
}

internal fun ModelLayer.modelTranslationTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun ModelLayer.modelTranslation(expression: List<Double>) {
    TODO("v11 only")
}

internal fun ModelLayer.modelTranslation(expression: Expression) {
    TODO("v11 only")
}

internal fun ModelLayer.modelOpacityTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun ModelLayer.modelOpacity(expression: Double) {
    TODO("v11 only")
}

internal fun RasterLayer.rasterColorRangeTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun RasterLayer.rasterColorRange(expression: List<Double>) {
    TODO("v11 only")
}

internal fun RasterLayer.rasterColorRange(expression: Expression) {
    TODO("v11 only")
}

internal fun RasterLayer.rasterColorMixTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun RasterLayer.rasterColorMix(expression: List<Double>) {
    TODO("v11 only")
}

internal fun RasterLayer.rasterColorMix(expression: Expression) {
    TODO("v11 only")
}

internal fun RasterLayer.rasterColor(rasterColor: Expression) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionCutoffFadeRange(expression: Double) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionCutoffFadeRange(expression: Expression) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionVerticalScaleTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightIntensity(expression: Double) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightGroundAttenuation(expression: Double) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionAmbientOcclusionGroundAttenuationTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionAmbientOcclusionWallRadius(expression: Double) {
    TODO("v11 only")
}

internal fun SymbolLayer.iconImageCrossFade(expression: Double) {
    TODO("v11 only")
}

internal fun SymbolLayer.iconEmissiveStrength(expression: Double) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionVerticalScale(expression: Double) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionVerticalScale(expression: Expression) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightGroundAttenuationTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightGroundAttenuation(expression: Expression) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightGroundRadiusTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightGroundRadius(expression: Double) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightGroundRadius(expression: Expression) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightWallRadiusTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightWallRadius(expression: Double) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightWallRadius(expression: Expression) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightIntensityTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightColorTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightColor(expression: Int) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionFloodLightColor(expression: Expression) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionAmbientOcclusionGroundAttenuation(expression: Double) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionAmbientOcclusionGroundAttenuation(expression: Expression) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionAmbientOcclusionGroundRadiusTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionAmbientOcclusionGroundRadius(expression: Double) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionAmbientOcclusionGroundRadius(expression: Expression) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionAmbientOcclusionWallRadiusTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun FillExtrusionLayer.fillExtrusionRoundedRoof(value: Boolean) {
    TODO("v11 only")
}

internal fun CircleLayer.circleEmissiveStrengthTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun CircleLayer.circleEmissiveStrength(expression: Double) {
    TODO("v11 only")
}

internal fun CircleLayer.circleEmissiveStrength(expression: Expression) {
    TODO("v11 only")
}

internal fun SymbolLayer.iconImageCrossFadeTransition(transition: StyleTransition) {
    TODO("v11 only")
}

internal fun SymbolLayer.textEmissiveStrength(value: Expression) {
    TODO("v11 only")
}

internal fun SymbolLayer.iconEmissiveStrengthTransition(transition: StyleTransition) {
    TODO("v11 only")
}



class FillExtrusionBaseAlignment(valueOf: Any) {
    companion object
}

internal fun FillExtrusionBaseAlignment.Companion.valueOf(enumName: String) : String {
    return enumName
}

internal fun LineElevationReference.Companion.valueOf(enumName: String) : String {
    return enumName
}

class LineElevationReference {
    companion object
}

internal fun SymbolLayer.textOcclusionOpacityTransition(
    transition: StyleTransition
) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.textOcclusionOpacity(
    expression: Expression
) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.textOcclusionOpacity(
    value: Double
) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.iconOcclusionOpacity(
    expression: Expression
) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.iconOcclusionOpacity(
    value: Double
) {
    TODO("Not yet implemented")
}

internal fun LineLayer.lineTrimColorTransition(
    transition: StyleTransition
) {
    TODO("Not yet implemented")
}

internal fun FillExtrusionLayer.fillExtrusionBaseAlignment(
    valueOf: Any
) {
    TODO("Not yet implemented")
}

internal fun FillExtrusionLayer.fillExtrusionLineWidthTransition(
    transition: StyleTransition
) {
    TODO("Not yet implemented")
}

internal fun RasterLayer.rasterElevationTransition(
    transition: StyleTransition
) {
    TODO("Not yet implemented")
}

internal fun BackgroundLayer.backgroundPitchAlignment(
    expression: Expression
) {
    TODO("Not yet implemented")
}

internal fun RasterLayer.rasterElevation(value: Double) {
    TODO("Not yet implemented")
}

internal fun RasterLayer.rasterElevation(expression: Expression) {
    TODO("Not yet implemented")
}

internal fun RasterLayer.rasterArrayBand(value: String) {
    TODO("Not yet implemented")
}

internal fun RasterLayer.rasterArrayBand(expression: Expression) {
    TODO("Not yet implemented")
}



internal fun RasterLayer.rasterEmissiveStrengthTransition(
    transition: StyleTransition
) {
    TODO("Not yet implemented")
}

internal fun RasterLayer.rasterEmissiveStrength(
    expression: Expression
) {
    TODO("Not yet implemented")
}

internal fun RasterLayer.rasterEmissiveStrength(
    value: Double
) {
    TODO("Not yet implemented")
}

internal fun FillExtrusionLayer.fillExtrusionLineWidth(
    value: Double
) {
    TODO("Not yet implemented")
}

internal fun FillExtrusionLayer.fillExtrusionLineWidth(
    value: Expression
) {
    TODO("Not yet implemented")
}

internal fun FillExtrusionLayer.fillExtrusionHeightAlignment(
    valueOf: String
) {
    TODO("Not yet implemented")
}

internal fun FillExtrusionLayer.fillExtrusionHeightAlignment(
    valueOf: Expression
) {
    TODO("Not yet implemented")
}

internal fun FillExtrusionLayer.fillExtrusionPatternCrossFade(
    value: Double
) {
    TODO("Not yet implemented")
}

internal fun FillExtrusionLayer.fillExtrusionPatternCrossFade(
    value: Expression
) {
    TODO("Not yet implemented")
}

internal fun CircleLayer.circleElevationReference(
    valueOf: Any
) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.symbolZOffsetTransition(
    transition: StyleTransition
) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.symbolZOffset(expression: Expression) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.symbolZOffset(value: Double) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.iconColorSaturation(
    expression: Expression
) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.iconColorSaturation(
    value: Double
) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.iconOcclusionOpacityTransition(
    transition: StyleTransition
) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.symbolElevationReference(
    expression: Expression
) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.symbolElevationReference(
    value: String
) {
    TODO("Not yet implemented")
}

internal fun LineLayer.lineOcclusionOpacityTransition(
    transition: StyleTransition
) {
    TODO("Not yet implemented")
}

internal fun LineLayer.lineOcclusionOpacity(
    expression: Expression
) {
    TODO("Not yet implemented")
}

internal fun LineLayer.lineOcclusionOpacity(
    value: Double
) {
    TODO("Not yet implemented")
}



internal fun LineLayer.lineTrimColor(value: Int) {
    TODO("Not yet implemented")
}

internal fun LineLayer.lineTrimFadeRange(expression: Expression) {
    TODO("Not yet implemented")
}

internal fun LineLayer.linePatternCrossFade(expression: Expression) {
    TODO("Not yet implemented")
}

internal fun LineLayer.linePatternCrossFade(value: Double) {
    TODO("Not yet implemented")
}

internal fun LineLayer.lineCrossSlope(value: Double) {
    TODO("Not yet implemented")
}

internal fun LineLayer.lineCrossSlope(expression: Expression) {
    TODO("Not yet implemented")
}

internal fun LineLayer.lineElevationReference(
    expression: Expression
) {
}

internal fun LineLayer.lineElevationReference(
    value: Double
) {
}

internal fun LineLayer.lineElevationReference(
    value: String
) {
}

internal fun LineLayer.lineZOffset(expression: Expression) {}

internal fun LineLayer.lineZOffset(value: Double) {}

internal fun FillLayer.fillPatternCrossFade(
    expression: Expression
) {
    TODO("Not yet implemented")
}

internal fun FillLayer.fillPatternCrossFade(
    value: Double
) {
    TODO("Not yet implemented")
}

// Missing v10 dummy functions for compilation errors
internal fun LineLayer.lineTrimFadeRange(value: Any) {
    TODO("Not yet implemented")
}

internal fun LineLayer.lineTrimColor(expression: Expression) {
    TODO("Not yet implemented")
}

internal fun RasterLayer.rasterBrightness(value: Double) {
    TODO("Not yet implemented")
}

internal fun LineLayer.lineDasharray(value: FloatArray) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.textField(expression: Expression) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.textField(value: String) {
    TODO("Not yet implemented")
}

internal fun SymbolLayer.textVariableAnchor(value: Double) {
    TODO("Not yet implemented")
}

internal fun BackgroundLayer.backgroundPitchAlignment(value: Any) {
    TODO("Not yet implemented")
}

// Missing enum classes for v10 compatibility (dummy implementations)
internal fun SymbolElevationReference.Companion.valueOf(enumName: String) : String {
    return enumName
}

class SymbolElevationReference {
    companion object
}

internal fun CircleElevationReference.Companion.valueOf(enumName: String) : String {
    return enumName
}

class CircleElevationReference {
    companion object
}

internal fun FillExtrusionHeightAlignment.Companion.valueOf(enumName: String) : String {
    return enumName
}

class FillExtrusionHeightAlignment {
    companion object
}

internal fun BackgroundPitchAlignment.Companion.valueOf(enumName: String) : String {
    return enumName
}

class BackgroundPitchAlignment {
    companion object
}

fun FillExtrusionLayer.fillExtrusionEdgeRadius(
    expression: Expression
) {
    // V11 only
}

fun FillExtrusionLayer.fillExtrusionEdgeRadius(
    value: Double
) {
    // V11 only
}

fun FillExtrusionLayer.fillExtrusionEmissiveStrength(
    expression: Expression
) {
    // V11 only
}

fun FillExtrusionLayer.fillExtrusionEmissiveStrength(
    value: Double
) {
    // V11 only
}

fun FillExtrusionLayer.fillExtrusionEmissiveStrengthTransition(
    transition: StyleTransition
) {
    // V11 only
}

// RasterParticleLayer - v11 only
internal fun setRasterParticleLayerStyle(layer: Any, style: Any) {
    TODO("RasterParticleLayer is v11 only")
}

internal fun setVisibility(layer: Any, styleValue: Any) {
    TODO("RasterParticleLayer is v11 only")
}

internal fun setRasterParticleArrayBand(layer: Any, styleValue: Any) {
    TODO("RasterParticleLayer is v11 only")
}

internal fun setRasterParticleCount(layer: Any, styleValue: Any) {
    TODO("RasterParticleLayer is v11 only")
}

internal fun setRasterParticleColor(layer: Any, styleValue: Any) {
    TODO("RasterParticleLayer is v11 only")
}

internal fun setRasterParticleMaxSpeed(layer: Any, styleValue: Any) {
    TODO("RasterParticleLayer is v11 only")
}

internal fun setRasterParticleSpeedFactor(layer: Any, styleValue: Any) {
    TODO("RasterParticleLayer is v11 only")
}

internal fun setRasterParticleSpeedFactorTransition(layer: Any, styleValue: Any) {
    TODO("RasterParticleLayer is v11 only")
}

internal fun setRasterParticleFadeOpacityFactor(layer: Any, styleValue: Any) {
    TODO("RasterParticleLayer is v11 only")
}

internal fun setRasterParticleFadeOpacityFactorTransition(layer: Any, styleValue: Any) {
    TODO("RasterParticleLayer is v11 only")
}

internal fun setRasterParticleResetRateFactor(layer: Any, styleValue: Any) {
    TODO("RasterParticleLayer is v11 only")
}
