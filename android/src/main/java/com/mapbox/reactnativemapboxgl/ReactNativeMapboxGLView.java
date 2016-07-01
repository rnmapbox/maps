package com.mapbox.reactnativemapboxgl;

import android.content.Context;
import android.widget.LinearLayout;

import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.common.MapBuilder;
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.camera.CameraUpdateFactory;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.LatLngBounds;
import com.mapbox.mapboxsdk.maps.MapView;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.MapboxMapOptions;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;
import com.mapbox.mapboxsdk.maps.UiSettings;

import java.util.Map;

import javax.annotation.Nullable;

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
    private boolean _zoomEnabled = true;
    private boolean _scrollEnabled = true;
    private boolean _rotateEnabled = true;
    private int _paddingTop, _paddingRight, _paddingBottom, _paddingLeft;

    public ReactNativeMapboxGLView(Context context, ReactNativeMapboxGLManager manager) {
        super(context);
        _manager = manager;
        _mapOptions = MapboxMapOptions.createFromAttributes(context, null);
        _mapOptions.zoomGesturesEnabled(true);
        _mapOptions.rotateGesturesEnabled(true);
        _mapOptions.scrollGesturesEnabled(true);
        _mapOptions.tiltGesturesEnabled(true);
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
        if (_mapView != null) {
            if (!_paused) {
                _paused = true;
                _mapView.onPause();
            }
            _mapView.onDestroy();
        }
        _manager.getContext().removeLifecycleEventListener(this);
        super.onDetachedFromWindow();
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
        _mapView = null;
        _map = null;
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
        _map.setPadding(_paddingLeft, _paddingTop, _paddingRight, _paddingBottom);
        UiSettings uiSettings = _map.getUiSettings();
        uiSettings.setZoomGesturesEnabled(_zoomEnabled);
        uiSettings.setScrollGesturesEnabled(_scrollEnabled);
        uiSettings.setRotateGesturesEnabled(_rotateEnabled);

        // If these settings changed between setupMapView() and onMapReady(), coerce them to their right values
        // This doesn't happen in the current implementation of MapView, but let's be future proof
        if (_map.isDebugActive() != _mapOptions.getDebugActive()) {
            _map.setDebugActive(_mapOptions.getDebugActive());
        }
        if (!_map.getStyleUrl().equals(_mapOptions.getStyle())) {
            _map.setStyleUrl(_mapOptions.getStyle());
        }
        if (uiSettings.isLogoEnabled() != _mapOptions.getLogoEnabled()) {
            uiSettings.setLogoEnabled(_mapOptions.getLogoEnabled());
        }
        if (uiSettings.isAttributionEnabled() != _mapOptions.getAttributionEnabled()) {
            uiSettings.setAttributionEnabled(_mapOptions.getAttributionEnabled());
        }
        if (uiSettings.isCompassEnabled() != _mapOptions.getCompassEnabled()) {
            uiSettings.setCompassEnabled(_mapOptions.getCompassEnabled());
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
        if (_rotateEnabled == value) { return; }
        _rotateEnabled = value;
        if (_map != null) {
            _map.getUiSettings().setRotateGesturesEnabled(value);
        }
    }

    public void setScrollEnabled(boolean value) {
        if (_scrollEnabled == value) { return; }
        _scrollEnabled = value;
        if (_map != null) {
            _map.getUiSettings().setScrollGesturesEnabled(value);
        }
    }

    public void setZoomEnabled(boolean value) {
        if (_zoomEnabled == value) { return; }
        _zoomEnabled = value;
        if (_map != null) {
            _map.getUiSettings().setZoomGesturesEnabled(value);
        }
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
        if (_map != null) {
            _map.getUiSettings().setAttributionEnabled(!value);
        }
    }

    public void setLogoIsHidden(boolean value) {
        if (_mapOptions.getLogoEnabled() == !value) { return; }
        _mapOptions.logoEnabled(!value);
        if (_map != null) {
            _map.getUiSettings().setLogoEnabled(!value);
        }
    }

    public void setCompassIsHidden(boolean value) {
        if (_mapOptions.getCompassEnabled() == !value) { return; }
        _mapOptions.compassEnabled(!value);
        if (_map != null) {
            _map.getUiSettings().setCompassEnabled(!value);
        }
    }

    public void setContentInset(int top, int right, int bottom, int left) {
        if (top == _paddingTop &&
            bottom == _paddingBottom &&
            left == _paddingLeft &&
            right == _paddingRight) { return; }
        _paddingTop = top;
        _paddingRight = right;
        _paddingBottom = bottom;
        _paddingLeft = left;
        if (_map != null) { _map.setPadding(left, top, right, bottom); }
    }

    // Getters

    public CameraPosition getCameraPosition() {
        if (_map == null) { return _initialCamera.build(); }
        return _map.getCameraPosition();
    }

    public LatLngBounds getBounds() {
        if (_map == null) { return new LatLngBounds.Builder().build(); };
        return _map.getProjection().getVisibleRegion().latLngBounds;
    }

    // Camera setters

    public void setCameraPosition(CameraPosition position, int duration, @Nullable Runnable callback) {
        if (_map == null) {
            _initialCamera = new CameraPosition.Builder(position);
            if (callback != null) { callback.run(); }
            return;
        }

        CameraUpdate update = CameraUpdateFactory.newCameraPosition(position);
        setCameraUpdate(update, duration, callback);
    }

    public void setCameraUpdate(CameraUpdate update, int duration, @Nullable Runnable callback) {
        if (_map == null) {
            return;
        }

        if (duration == 0) {
            _map.moveCamera(update);
            if (callback != null) { callback.run(); }
        } else {
            // Ugh... Java callbacks suck
            class CameraCallback implements MapboxMap.CancelableCallback {
                Runnable callback;
                CameraCallback(Runnable callback) {
                    this.callback = callback;
                }
                @Override
                public void onCancel() {
                    if (callback != null) { callback.run(); }
                }

                @Override
                public void onFinish() {
                    if (callback != null) { callback.run(); }
                }
            }

            _map.animateCamera(update, duration, new CameraCallback(callback));
        }
    }
}
