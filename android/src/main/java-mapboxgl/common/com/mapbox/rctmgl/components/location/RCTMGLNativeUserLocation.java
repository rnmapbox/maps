package com.mapbox.rctmgl.components.location;

import android.annotation.SuppressLint;
import android.content.Context;
import androidx.annotation.NonNull;

import com.mapbox.rctmgl.impl.PermissionsManagerImpl;

import com.mapbox.mapboxsdk.location.modes.RenderMode;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;
import com.mapbox.mapboxsdk.maps.Style;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;

public class RCTMGLNativeUserLocation extends AbstractMapFeature implements OnMapReadyCallback, Style.OnStyleLoaded {
    private boolean mEnabled = true;
    private MapboxMap mMap;
    private RCTMGLMapView mMapView;
    private @RenderMode.Mode int mRenderMode = RenderMode.COMPASS;

    public RCTMGLNativeUserLocation(Context context) {
        super(context);
    }

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        mEnabled = true;
        mMapView = mapView;
        mapView.getMapAsync(this);
        setRenderMode(mRenderMode);
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        mEnabled = false;
        if (mMap != null) mMap.getStyle(this);
    }

    @SuppressLint("MissingPermission")
    @Override
    public void onMapReady(@NonNull MapboxMap mapboxMap) {
        mMap = mapboxMap;
        mapboxMap.getStyle(this);
    }

    @SuppressLint("MissingPermission")
    @Override
    public void onStyleLoaded(@NonNull Style style) {
        Context context = getContext();
        if (!PermissionsManagerImpl.areLocationPermissionsGranted(context)) {
            return;
        }

        LocationComponentManager locationComponent = mMapView.getLocationComponentManager();
        locationComponent.update(style);
        locationComponent.showUserLocation(mEnabled);
    }

    public void setRenderMode(@RenderMode.Mode int renderMode) {
        mRenderMode = renderMode;
        if (mMapView != null) {
            LocationComponentManager locationComponent = mMapView.getLocationComponentManager();
            locationComponent.setRenderMode(renderMode);
        }
    }
}
