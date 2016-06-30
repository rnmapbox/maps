package com.mapbox.reactnativemapboxgl;

import android.content.Context;
import android.util.Log;
import android.widget.LinearLayout;

import com.facebook.react.bridge.LifecycleEventListener;
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.maps.MapView;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.MapboxMapOptions;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;

public class ReactNativeMapboxGLView extends LinearLayout implements OnMapReadyCallback, LifecycleEventListener {

    private MapboxMap _map = null;
    private MapView _mapView = null;
    private ReactNativeMapboxGLManager _manager;
    private boolean _paused = false;

    private CameraPosition.Builder _initialCamera = new CameraPosition.Builder();
    private MapboxMapOptions _mapOptions;
    private int _locationTrackingMode;
    private int _bearingTrackingMode;
    private boolean _showsUserLocation;

    public ReactNativeMapboxGLView(Context context, ReactNativeMapboxGLManager manager) {
        super(context);
        _manager = manager;
        _mapOptions = MapboxMapOptions.createFromAttributes(context, null);
    }

    // Lifecycle methods

    @Override
    public void onAttachedToWindow () {
        super.onAttachedToWindow();
        if (_mapView == null) {
            setupMapView();
        }
        _mapView.onCreate(null);
        _paused = false;
        _mapView.onResume();
        _manager.getContext().addLifecycleEventListener(this);
    }

    @Override
    public void onDetachedFromWindow () {
        super.onDetachedFromWindow();
        if (!_paused) {
            _paused = true;
            _mapView.onPause();
        }
        _mapView.onDestroy();
        _manager.getContext().removeLifecycleEventListener(this);
    }

    @Override
    public void onHostResume() {
        _paused = false;
        _mapView.onResume();
    }

    @Override
    public void onHostPause() {
        _paused = true;
        _mapView.onPause();
    }

    @Override
    public void onHostDestroy() {
        _mapView.onDestroy();
    }

    // Initialization

    private void setupMapView() {
        _mapOptions.camera(_initialCamera.build());
        _mapView = new MapView(this.getContext(), _mapOptions);
        _mapView.getMapAsync(this);
        this.addView(_mapView);
    }

    @Override
    public void onMapReady(MapboxMap mapboxMap) {
        _map = mapboxMap;
        _map.setMyLocationEnabled(_showsUserLocation);
        _map.getTrackingSettings().setMyLocationTrackingMode(_locationTrackingMode);
        _map.getTrackingSettings().setMyBearingTrackingMode(_bearingTrackingMode);

        // If these settings changed between setupMapView() and onMapReady(), coerce them to their right values
        if (_map.isDebugActive() != _mapOptions.getDebugActive()) {
            _map.setDebugActive(_mapOptions.getDebugActive());
        }
        if (!_map.getStyleUrl().equals(_mapOptions.getStyle())) {
            _map.setStyleUrl(_mapOptions.getStyle());
        }
    }

    // Utils

    private void assertNotChangeable(String propName) {
        if (_mapView != null) {
            Log.e(getContext().getPackageName(), "Changing MapView." + propName + " after component has been mounted is not currently supported");
        }
    }

    // Props

    public void setInitialZoomLevel(double value) {
        _initialCamera.zoom(value);
    }

    public void setInitialDirection(double value) {
        _initialCamera.bearing(value);
    }

    public void setInitialCenterCoordinate(double lat, double lon) {
        _initialCamera.target(new LatLng(lat, lon));
    }

    public void setShowsUserLocation(boolean value) {
        if (_showsUserLocation == value) { return; }
        _showsUserLocation = value;
        if (_map != null) { _map.setMyLocationEnabled(value); }
    }

    public void setRotateEnabled(boolean value) {
        if (_mapOptions.getRotateGesturesEnabled() == value) { return; }
        _mapOptions.rotateGesturesEnabled(value);
        assertNotChangeable("rotateEnabled");
    }

    public void setScrollEnabled(boolean value) {
        if (_mapOptions.getScrollGesturesEnabled() == value) { return; }
        _mapOptions.scrollGesturesEnabled(value);
        assertNotChangeable("scrollEnabled");
    }

    public void setZoomEnabled(boolean value) {
        if (_mapOptions.getZoomGesturesEnabled() == value) { return; }
        _mapOptions.zoomGesturesEnabled(value);
        assertNotChangeable("zoomEnabled");
    }

    public void setStyleURL(String styleURL) {
        if (styleURL.equals(_mapOptions.getStyle())) { return; }
        _mapOptions.styleUrl(styleURL);
        if (_map != null) { _map.setStyleUrl(styleURL); }
    }

    public void setDebugActive(boolean value) {
        if (_mapOptions.getDebugActive() == value) { return; }
        _mapOptions.debugActive(value);
        if (_map != null) { _map.setDebugActive(value); };
    }

    public void setLocationTracking(int value) {
        if (_locationTrackingMode == value) { return; }
        _locationTrackingMode = value;
        if (_map != null) { _map.getTrackingSettings().setMyLocationTrackingMode(value); };
    }

    public void setBearingTracking(int value) {
        if (_bearingTrackingMode == value) { return; }
        _bearingTrackingMode = value;
        if (_map != null) { _map.getTrackingSettings().setMyBearingTrackingMode(value); };
    }

    public void setAttributionButtonIsHidden(boolean value) {
        if (_mapOptions.getAttributionEnabled() == !value) { return; }
        _mapOptions.attributionEnabled(!value);
        assertNotChangeable("attributionButtonIsHidden");
    }

    public void setLogoIsHidden(boolean value) {
        if (_mapOptions.getLogoEnabled() == !value) { return; }
        _mapOptions.logoEnabled(!value);
        assertNotChangeable("logoIsHidden");
    }

    public void setCompassIsHidden(boolean value) {
        if (_mapOptions.getCompassEnabled() == !value) { return; }
        _mapOptions.compassEnabled(!value);
        assertNotChangeable("compassIsHidden");
    }
}
