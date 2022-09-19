package com.mapbox.rctmgl.components

import android.content.Context
import com.facebook.react.views.view.ReactViewGroup
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView

abstract class AbstractMapFeature(context: Context?) : ReactViewGroup(context) {
    abstract fun addToMap(mapView: RCTMGLMapView)
    abstract fun removeFromMap(mapView: RCTMGLMapView)
}