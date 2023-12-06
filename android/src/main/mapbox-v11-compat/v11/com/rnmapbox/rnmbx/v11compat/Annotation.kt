package com.rnmapbox.rnmbx.v11compat.annotation;

import android.view.View
import com.mapbox.geojson.Geometry
import com.mapbox.geojson.Point
import com.mapbox.maps.ScreenCoordinate
import com.mapbox.maps.ViewAnnotationAnchor
import com.mapbox.maps.ViewAnnotationAnchorConfig
import com.mapbox.maps.ViewAnnotationOptions
import com.mapbox.maps.viewannotation.geometry as _geometry

import com.mapbox.maps.viewannotation.OnViewAnnotationUpdatedListener as _OnViewAnnotationUpdatedListener



public const val INVALID_ANNOTATION_ID = ""
typealias AnnotationID = String


fun ViewAnnotationOptions.Builder.geometry(point: Geometry): ViewAnnotationOptions.Builder {
  return _geometry(point)
}

fun ViewAnnotationOptions.Builder.offsets(x: Double, y: Double) {
  this.variableAnchors(listOf(
    ViewAnnotationAnchorConfig.Builder().anchor(ViewAnnotationAnchor.CENTER).offsetY(x).offsetY(y).build()
  ))
}

abstract class OnViewAnnotationUpdatedListener : _OnViewAnnotationUpdatedListener {

}
