package com.rnmapbox.rnmbx.v11compat.stylefactory;

import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.layers.generated.RasterLayer

fun RasterLayer.rasterColor(rasterColor: Int) {
    this.rasterColor(Expression.color(rasterColor))
}
