package com.rnmapbox.rnmbx.components

import android.content.Context
import com.facebook.react.views.view.ReactViewGroup
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView

enum class RemovalReason {
    /** The component was unmounted from its parent. */
    VIEW_REMOVAL,
    /** The style is reloading; the component is added back once the new style loads. */
    STYLE_CHANGE,
    /** The map is being torn down while the component is still attached to it. */
    ON_DESTROY,
    /** The layer is being moved; it is added back right away. */
    REORDER
}

abstract class AbstractMapFeature(context: Context?) : ReactViewGroup(context) {
    protected var mMapView: RNMBXMapView? = null;
    private var mWithMapViewCallbacks: Array<((RNMBXMapView) -> Unit)>? = null;

    open var requiresStyleLoad = true;

    open fun addToMap(mapView: RNMBXMapView) {
        mMapView = mapView;
        mWithMapViewCallbacks?.forEach { it(mapView) }
        mWithMapViewCallbacks = null;
    }

    // return false if you don not want to remove this feature based on reason
    open fun removeFromMap(mapView: RNMBXMapView,reason: RemovalReason) : Boolean {
        mMapView = null;
        return true;
    }

    internal fun withMapView(callback: (mapView: RNMBXMapView) -> Unit) {
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