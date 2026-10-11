package com.rnmapbox.rnmbx.components.mapview

/**
 * Axis-aligned query box in physical pixels.
 *
 * [minX]/[minY] is the top-left corner and [maxX]/[maxY] is the bottom-right,
 * matching [com.mapbox.maps.ScreenBox].
 */
internal data class QueryBoxPx(
    val minX: Double,
    val minY: Double,
    val maxX: Double,
    val maxY: Double,
)

/**
 * Builds the rendered-feature query box for a source press.
 *
 * [hitboxWidthDp] and [hitboxHeightDp] are density-independent pixels, the same
 * unit as the JS `hitbox` prop and as iOS points. [screenXPx] and [screenYPx]
 * are physical pixels (`pixelForCoordinate`). [density] is
 * `DisplayMetrics.density`.
 */
internal fun hitboxQueryBoxPx(
    screenXPx: Double,
    screenYPx: Double,
    hitboxWidthDp: Double,
    hitboxHeightDp: Double,
    density: Double,
): QueryBoxPx {
    val halfWidthPx = hitboxWidthDp / 2.0 * density
    val halfHeightPx = hitboxHeightDp / 2.0 * density
    return QueryBoxPx(
        minX = screenXPx - halfWidthPx,
        minY = screenYPx - halfHeightPx,
        maxX = screenXPx + halfWidthPx,
        maxY = screenYPx + halfHeightPx,
    )
}
