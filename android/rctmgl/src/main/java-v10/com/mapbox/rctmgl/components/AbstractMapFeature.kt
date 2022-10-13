package com.mapbox.rctmgl.components

import android.content.Context
import com.facebook.react.views.view.ReactViewGroup
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView

abstract class AbstractMapFeature(context: Context?) : ReactViewGroup(context) {
    protected var mMapView: RCTMGLMapView? = null;
    private var mWithMapViewCallbacks: Array<((RCTMGLMapView) -> Unit)>? = null;

    open fun addToMap(mapView: RCTMGLMapView) {
        mMapView = mapView;
        mWithMapViewCallbacks?.forEach { it(mapView) }
        mWithMapViewCallbacks = null;
    }

    open fun removeFromMap(mapView: RCTMGLMapView) {
        mMapView = null;
    }

    internal fun withMapView(callback: (mapView: RCTMGLMapView) -> Unit) {
        val mapView = mMapView;
        if (mapView == null) {
            val callbacks = mWithMapViewCallbacks ?: arrayOf();
            callbacks.plus(callback)
            mWithMapViewCallbacks = callbacks
        } else {
            callback(mapView)
        }
    }
}