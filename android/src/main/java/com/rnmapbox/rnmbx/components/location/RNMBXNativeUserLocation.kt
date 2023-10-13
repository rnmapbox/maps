package com.rnmapbox.rnmbx.components.location

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import com.mapbox.android.core.permissions.PermissionsManager
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.Style
import com.rnmapbox.rnmbx.R
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.OnMapReadyCallback
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.v11compat.image.AppCompatResourcesV11
import com.rnmapbox.rnmbx.v11compat.location.PuckBearingSource

enum class RenderMode {
    GPS, COMPASS, NORMAL
}

class RNMBXNativeUserLocation(context: Context) : AbstractMapFeature(context), OnMapReadyCallback, Style.OnStyleLoaded {
    private var mEnabled = true
    private var mMap: MapboxMap? = null
    private var mRenderMode : RenderMode = RenderMode.NORMAL;
    private var mContext : Context = context
    var mTopImage: String? = null
        set(value) {
            field = value
            applyChanges()
        }
    var mBearingImage: String? = null
        set(value) {
            field = value
            applyChanges()
        }
    var mShadowImage: String? = null
        set(value) {
            field = value
            applyChanges()
        }
    var mScale: Double = 1.0
        set(value) {
            field = value
            applyChanges()
        }

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

    @SuppressLint("DiscouragedApi")
    fun applyChanges() {
        Log.d(
            "***",
            "mTopImage: ${mTopImage}, mBearingImage: ${mBearingImage}, mShadowImage: ${mShadowImage}"
        )
        val useCustomImages = mTopImage != null || mBearingImage != null || mShadowImage != null

        val bearingImageResourceId = if (mBearingImage != null) {
            context.resources.getIdentifier(
                mBearingImage,
                "drawable",
                context.packageName
            )
        } else if (useCustomImages) {
            null
        } else when (mRenderMode) {
            RenderMode.GPS -> R.drawable.mapbox_user_bearing_icon
            RenderMode.COMPASS -> R.drawable.mapbox_user_puck_icon
            RenderMode.NORMAL -> R.drawable.mapbox_user_stroke_icon
        }

        val topImageResourceId = if (mTopImage != null) {
            context.resources.getIdentifier(
                mTopImage,
                "drawable",
                context.packageName
            )
        } else if (useCustomImages) {
            null
        } else R.drawable.mapbox_user_icon

        val shadowImageResourceId = if (mShadowImage != null) {
            context.resources.getIdentifier(
                mShadowImage,
                "drawable",
                context.packageName
            )
        } else if (useCustomImages) {
            null
        } else R.drawable.mapbox_user_icon_shadow

        val puckBearingSource = when (mRenderMode) {
            RenderMode.GPS -> PuckBearingSource.COURSE
            RenderMode.COMPASS -> PuckBearingSource.HEADING
            RenderMode.NORMAL -> null
        }
        val pulsing = mRenderMode == RenderMode.NORMAL


        mMapView?.locationComponentManager?.let { locationComponentManager ->
            // emulate https://docs.mapbox.com/android/legacy/maps/guides/location-component/
            locationComponentManager.update { state ->
                state.copy(
                    bearingImage = bearingImageResourceId?.let { bearingImageResourceId ->
                        AppCompatResourcesV11.getDrawableImageHolder(
                            mContext,
                            bearingImageResourceId
                        )
                    },
                    topImage = topImageResourceId?.let { topImageResourceId ->
                        AppCompatResourcesV11.getDrawableImageHolder(
                            mContext,
                            topImageResourceId
                        )
                    },
                    shadowImage = shadowImageResourceId?.let { shadowImageResourceId ->
                        AppCompatResourcesV11.getDrawableImageHolder(
                            mContext,
                            shadowImageResourceId
                        )
                    },
                    puckBearingSource = puckBearingSource,
                    pulsing = pulsing,
                    scale = mScale
                )
            }
        }
    }
}