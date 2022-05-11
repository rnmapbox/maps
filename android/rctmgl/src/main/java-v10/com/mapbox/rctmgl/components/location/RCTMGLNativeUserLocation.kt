package com.mapbox.rctmgl.components.location

import android.annotation.SuppressLint
import android.content.Context
import com.mapbox.rctmgl.components.mapview.OnMapReadyCallback
import com.mapbox.maps.MapboxMap
import com.mapbox.android.core.permissions.PermissionsManager
import com.mapbox.maps.Style
import com.mapbox.rctmgl.components.AbstractMapFeature
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView

/*
import com.mapbox.mapboxsdk.location.modes.RenderMode;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;
import com.mapbox.mapboxsdk.maps.Style;
 */   class RCTMGLNativeUserLocation(context: Context?) : AbstractMapFeature(context), OnMapReadyCallback, Style.OnStyleLoaded {
    private var mEnabled = true
    private var mMap: MapboxMap? = null
    private var mMapView: RCTMGLMapView? = null

    @RenderMode.Mode
    private var mRenderMode = RenderMode.COMPASS
    override fun addToMap(mapView: RCTMGLMapView) {
        mEnabled = true
        mMapView = mapView
        mapView.getMapboxMap()
        mapView.getMapAsync(this)
        setRenderMode(mRenderMode)
    }

    override fun removeFromMap(mapView: RCTMGLMapView) {
        mEnabled = false
        mMap?.getStyle(this)
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
        mMapView?.locationComponentManager?.showUserLocation(mEnabled)
    }

    fun setRenderMode(@RenderMode.Mode renderMode: Int) {
        mRenderMode = renderMode
        mMapView?.locationComponentManager?.setRenderMode(renderMode)
    }
}