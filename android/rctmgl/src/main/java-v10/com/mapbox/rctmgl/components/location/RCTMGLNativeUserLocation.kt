package com.mapbox.rctmgl.components.location

import android.annotation.SuppressLint
import android.content.Context
import com.mapbox.rctmgl.components.mapview.OnMapReadyCallback
import com.mapbox.maps.MapboxMap
import com.mapbox.android.core.permissions.PermissionsManager
import com.mapbox.maps.Style
import com.mapbox.rctmgl.components.AbstractMapFeature
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView

class RCTMGLNativeUserLocation(context: Context?) : AbstractMapFeature(context), OnMapReadyCallback, Style.OnStyleLoaded {
    private var mEnabled = true
    private var mMap: MapboxMap? = null

    override fun addToMap(mapView: RCTMGLMapView) {
        super.addToMap(mapView)
        mEnabled = true
        mapView.getMapboxMap()
        mapView.getMapAsync(this)
        mMapView?.locationComponentManager?.showNativeUserLocation(true)
    }

    override fun removeFromMap(mapView: RCTMGLMapView) {
        mEnabled = false
        mMapView?.locationComponentManager?.showNativeUserLocation(false)
        mMap?.getStyle(this)
        super.removeFromMap(mapView)
    }

    @SuppressLint("MissingPermission")
    override fun onMapReady(mapboxMap: MapboxMap) {
        mMap = mapboxMap
        mapboxMap.getStyle(this)
    }

    @SuppressLint("MissingPermission")
    override fun onStyleLoaded(style: Style) {
        val context = context
        if (!PermissionsManager.areLocationPermissionsGranted(context)) {
            return
        }

        mMapView?.locationComponentManager?.update(style)
        mMapView?.locationComponentManager?.showNativeUserLocation(mEnabled)
    }
}