package com.mapbox.rnmbx.components.location

import android.annotation.SuppressLint
import android.content.Context
import androidx.appcompat.content.res.AppCompatResources
import com.mapbox.rnmbx.components.mapview.OnMapReadyCallback
import com.mapbox.maps.MapboxMap
import com.mapbox.android.core.permissions.PermissionsManager
import com.mapbox.maps.Style
import com.mapbox.rnmbx.R
import com.mapbox.rnmbx.components.AbstractMapFeature
import com.mapbox.rnmbx.components.RemovalReason
import com.mapbox.rnmbx.components.mapview.RNMBXMapView

import com.mapbox.rnmbx.v11compat.location.PuckBearingSource
import com.mapbox.rnmbx.v11compat.image.AppCompatResourcesV11

enum class RenderMode {
    GPS, COMPASS, NORMAL
}

class RNMBXNativeUserLocation(context: Context) : AbstractMapFeature(context), OnMapReadyCallback, Style.OnStyleLoaded {
    private var mEnabled = true
    private var mMap: MapboxMap? = null
    private var mRenderMode : RenderMode = RenderMode.NORMAL;
    private var mContext : Context = context

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        mEnabled = true
        mapView.getMapboxMap()
        mapView.getMapAsync(this)
        mMapView?.locationComponentManager?.showNativeUserLocation(true)
        applyChanges()
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        mEnabled = false
        mMapView?.locationComponentManager?.showNativeUserLocation(false)
        mMap?.getStyle(this)
        return super.removeFromMap(mapView, reason)
    }

    @SuppressLint("MissingPermission")
    override fun onMapReady(mapboxMap: MapboxMap) {
        mMap = mapboxMap
        mapboxMap.getStyle(this)
        applyChanges()
    }

    fun setAndroidRenderMode(renderMode: RenderMode) {
        mRenderMode = renderMode;
        applyChanges();
    }

    @SuppressLint("MissingPermission")
    override fun onStyleLoaded(style: Style) {
        val context = context
        if (!PermissionsManager.areLocationPermissionsGranted(context)) {
            return
        }

        mMapView?.locationComponentManager?.update()
        mMapView?.locationComponentManager?.showNativeUserLocation(mEnabled)
    }

    fun applyChanges() {
        mMapView?.locationComponentManager?.let {
            // emulate https://docs.mapbox.com/android/legacy/maps/guides/location-component/
            when (mRenderMode) {
                RenderMode.NORMAL ->
                    it.update { it.copy(bearingImage =  null, puckBearingSource = null)}
                RenderMode.GPS -> it.update {
                    it.copy(bearingImage =  AppCompatResourcesV11.getDrawableImageHolder(
                        mContext, R.drawable.mapbox_user_bearing_icon
                    ), puckBearingSource = PuckBearingSource.COURSE) }
                RenderMode.COMPASS -> it.update{ it.copy(bearingImage=  AppCompatResourcesV11.getDrawableImageHolder(
                    mContext, R.drawable.mapbox_user_puck_icon
                ), puckBearingSource = PuckBearingSource.HEADING) }
            }
        }
    }
}