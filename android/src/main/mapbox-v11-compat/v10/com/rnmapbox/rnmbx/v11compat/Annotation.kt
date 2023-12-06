package com.rnmapbox.rnmbx.v11compat.annotation;

import android.view.View
import com.mapbox.maps.ScreenCoordinate
import com.mapbox.maps.ViewAnnotationOptions
import com.mapbox.maps.viewannotation.OnViewAnnotationUpdatedListener as _OnViewAnnotationUpdatedListener


public const val INVALID_ANNOTATION_ID: Long = -1
typealias AnnotationID = Long

fun ViewAnnotationOptions.Builder.offsets(x: Double, y: Double): ViewAnnotationOptions.Builder {
  return offsetX(x.toInt()).offsetY(y.toInt())
} 

fun ViewAnnotationOptions.Builder.width(value: Double): ViewAnnotationOptions.Builder {
  return this.width(value.toInt())
} 

fun ViewAnnotationOptions.Builder.height(value: Double): ViewAnnotationOptions.Builder {
  return this.height(value.toInt())
}

fun com.mapbox.maps.ViewAnnotationOptions.Builder.allowOverlapWithPuck(value: Boolean): ViewAnnotationOptions.Builder {
  return this;
}

abstract class OnViewAnnotationUpdatedListener : _OnViewAnnotationUpdatedListener {
  override fun onViewAnnotationPositionUpdated(
    view: View,
    leftTopCoordinate: ScreenCoordinate,
    width: Int,
    height: Int
  ) {
  }
}
