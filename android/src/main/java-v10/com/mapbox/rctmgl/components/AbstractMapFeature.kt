package com.mapbox.rctmgl.components

import android.content.Context
import com.facebook.react.views.view.ReactViewGroup
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView

enum class RemovalReason {
    VIEW_REMOVAL,
    STYLE_CHANGE,
    ON_DESTROY,
    REORDER
}

abstract class AbstractMapFeature(context: Context?) : ReactViewGroup(context) {
    protected var mMapView: RCTMGLMapView? = null;
    private var mWithMapViewCallbacks: Array<((RCTMGLMapView) -> Unit)>? = null;

    open fun addToMap(mapView: RCTMGLMapView) {
        mMapView = mapView;
        mWithMapViewCallbacks?.forEach { it(mapView) }
        mWithMapViewCallbacks = null;
    }

    // return false if you don not want to remove this feature based on reason
    open fun removeFromMap(mapView: RCTMGLMapView,reason: RemovalReason) : Boolean {
        mMapView = null;
        return true;
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