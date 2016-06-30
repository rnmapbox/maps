package com.mapbox.reactnativemapboxgl;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.bridge.LifecycleEventListener;
import com.mapbox.mapboxsdk.maps.MapView;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;

public class ReactNativeMapboxGLView extends MapView implements OnMapReadyCallback, LifecycleEventListener {

    private MapboxMap _map = null;
    private ReactNativeMapboxGLManager _manager;
    private String _styleURL;
    private boolean _paused = false;
    private boolean _showsUserLocation = false;


    public ReactNativeMapboxGLView(Context context, ReactNativeMapboxGLManager manager) {
        super(context);
        this.getMapAsync(this);
        _manager = manager;
    }

    // Lifecycle methods

    @Override
    public void onAttachedToWindow () {
        super.onAttachedToWindow();
        onCreate(null);
        _paused = false;
        onResume();
        _manager.getContext().addLifecycleEventListener(this);
    }

    @Override
    public void onDetachedFromWindow () {
        super.onDetachedFromWindow();
        if (!_paused) {
            _paused = true;
            onPause();
        }
        onDestroy();
        _manager.getContext().removeLifecycleEventListener(this);
    }

    @Override
    public void onHostResume() {
        _paused = false;
        onResume();
    }

    @Override
    public void onHostPause() {
        _paused = true;
        onPause();
    }

    @Override
    public void onHostDestroy() {
        onDestroy();
    }

    @Override
    public void onMapReady(MapboxMap mapboxMap) {
        _map = mapboxMap;
        _map.setStyleUrl(_styleURL);
        _map.setMyLocationEnabled(_showsUserLocation);
    }

    // Props

    public void setStyleURL(String styleURL) {
        if (_styleURL != null && _styleURL.equals(styleURL)) {
            return;
        }
        _styleURL = styleURL;
        if (_map != null) { _map.setStyleUrl(styleURL); }
    }

    public void setShowsUserLocation(boolean value) {
        if (_showsUserLocation != value) { return; }
        _showsUserLocation = value;
        if (_map != null) { _map.setMyLocationEnabled(value); }
    }
}
