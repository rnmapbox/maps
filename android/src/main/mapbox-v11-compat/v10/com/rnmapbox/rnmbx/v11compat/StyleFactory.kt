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

internal fun LineLayer.lineEmissiveStrength(expression: Double) {
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


