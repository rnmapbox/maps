package com.mapbox.reactnativemapboxgl;

import android.content.Context;
import android.graphics.PointF;
import android.hardware.GeomagneticField;
import android.location.Location;
import android.os.Handler;
import android.support.annotation.NonNull;
import android.support.annotation.UiThread;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.touch.OnInterceptTouchEventListener;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.google.common.collect.Sets;
import com.mapbox.mapboxsdk.annotations.Annotation;
import com.mapbox.mapboxsdk.annotations.Marker;
import com.mapbox.mapboxsdk.annotations.MarkerView;
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

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nullable;

public class ReactNativeMapboxGLView extends RelativeLayout implements
        OnMapReadyCallback, LifecycleEventListener,
        MapboxMap.OnMapClickListener, MapboxMap.OnMapLongClickListener,
        MapboxMap.OnMyBearingTrackingModeChangeListener, MapboxMap.OnMyLocationTrackingModeChangeListener,
        MapboxMap.OnMyLocationChangeListener,
        MapboxMap.OnMarkerClickListener, MapboxMap.OnInfoWindowClickListener,
        MapView.OnMapChangedListener, ReactNativeMapboxGLManager.ChildListener
{

    private MapboxMap _map = null;
    private MapView _mapView = null;
    private ReactNativeMapboxGLManager _manager;
    private boolean _paused = false;

    private CameraPosition.Builder _initialCamera = new CameraPosition.Builder();
    private MapboxMapOptions _mapOptions;
    private int _locationTrackingMode;
    private int _bearingTrackingMode;
    private boolean _trackingModeUpdateScheduled = false;
    private boolean _showsUserLocation;
    private boolean _annotationsPopUpEnabled = true;
    private boolean _zoomEnabled = true;
    private double _minimumZoomLevel = 0;
    private double _maximumZoomLevel = 20;
    private boolean _pitchEnabled = true;
    private boolean _scrollEnabled = true;
    private boolean _rotateEnabled = true;
    private boolean _enableOnRegionWillChange = false;
    private boolean _enableOnRegionDidChange = false;
    private int _paddingTop, _paddingRight, _paddingBottom, _paddingLeft;
    private boolean _recentlyChanged = false;
    private boolean _willChangeThrottled = false;
    private boolean _didChangeThrottled = false;
    private boolean _changeWasAnimated = false;

    private Map<String, Annotation> _annotations = new HashMap<>();
    private Map<Long, String> _annotationIdsToName = new HashMap<>();
    private Map<String, RNMGLAnnotationOptions> _annotationOptions = new HashMap<>();
    private Map<String, MarkerView> _customAnnodationIds = new HashMap<>();
    private Map<String, RNMGLAnnotationView> _customAnnotationViewMap = new HashMap<>();
    private Map<RNMGLAnnotationView, RNMGLAnnotationView.PropertyListener> _propertyListeners = new HashMap<>();

    private Handler _handler;


    @UiThread
    public ReactNativeMapboxGLView(Context context, ReactNativeMapboxGLManager manager) {
        super(context);
        _handler = new android.os.Handler();
        _manager = manager;
        _mapOptions = MapboxMapOptions.createFromAttributes(context, null);
        _mapOptions.zoomGesturesEnabled(true);
        _mapOptions.rotateGesturesEnabled(true);
        _mapOptions.scrollGesturesEnabled(true);
        _mapOptions.tiltGesturesEnabled(true);
    }

    // Lifecycle methods

    public void onAfterUpdateTransaction() {
        if (_mapView != null) { return; }
        setupMapView();
        _paused = false;
        _mapView.onResume();
        _manager.getContext().addLifecycleEventListener(this);
    }

    public void onDrop() {
        if (_mapView == null) { return; }
        _manager.getContext().removeLifecycleEventListener(this);
        _manager.removeChildListener(this);
        if (!_paused) {
            _paused = true;
            _mapView.onPause();
        }
        destroyMapView();
        _mapView = null;
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
        onDrop();
    }

    // Initialization

    private void setupMapView() {
        _mapOptions.camera(_initialCamera.build());
        _mapView = new MapView(this.getContext(), _mapOptions);
        _manager.addView(this, _mapView, 0);
        _mapView.addOnMapChangedListener(this);
        _mapView.onCreate(null);
        _mapView.getMapAsync(this);
    }

    @Override
    public void onMapReady(MapboxMap mapboxMap) {
        if (_mapView == null) { return; }
        _map = mapboxMap;

        // Configure map
        _map.setMyLocationEnabled(_showsUserLocation);
        _map.getTrackingSettings().setMyLocationTrackingMode(_locationTrackingMode);
        _map.getTrackingSettings().setMyBearingTrackingMode(_bearingTrackingMode);
        _map.setPadding(_paddingLeft, _paddingTop, _paddingRight, _paddingBottom);
        _map.setMinZoom(_minimumZoomLevel);
        _map.setMaxZoom(_maximumZoomLevel);

        UiSettings uiSettings = _map.getUiSettings();
        uiSettings.setZoomGesturesEnabled(_zoomEnabled);
        uiSettings.setScrollGesturesEnabled(_scrollEnabled);
        uiSettings.setRotateGesturesEnabled(_rotateEnabled);
        uiSettings.setTiltGesturesEnabled(_pitchEnabled);

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

        // Attach listeners
        _map.setOnMapClickListener(this);
        _map.setOnMapLongClickListener(this);
        _map.setOnMyLocationTrackingModeChangeListener(this);
        _map.setOnMyBearingTrackingModeChangeListener(this);
        _map.setOnMyLocationChangeListener(this);
        _map.setOnMarkerClickListener(this);
        _map.setOnInfoWindowClickListener(this);

        // Create annotations
        for (Map.Entry<String, RNMGLAnnotationOptions> entry : _annotationOptions.entrySet()) {
            Annotation annotation = entry.getValue().addToMap(_map);
            _annotations.put(entry.getKey(), annotation);
            _annotationIdsToName.put(annotation.getId(), entry.getKey());
        }

        _annotationOptions.clear();

        _map.getMarkerViewManager().addMarkerViewAdapter(
                new RNMGLCustomMarkerViewAdapter(getContext()));
    }

    private void destroyMapView() {
        _mapView.removeOnMapChangedListener(this);
        if (_map != null) {
            _map.setOnMapClickListener(null);
            _map.setOnMapLongClickListener(null);
            _map.setOnMyLocationTrackingModeChangeListener(null);
            _map.setOnMyBearingTrackingModeChangeListener(null);
            _map.setOnMyLocationChangeListener(null);
            _map.setOnMarkerClickListener(null);
            _map.setOnInfoWindowClickListener(null);
            _map = null;
        }
        _mapView.onDestroy();
    }

    // Children

    @Override
    public void childAdded(View child) {
        if (child instanceof RNMGLAnnotationView) {
            updateMarkerAnnotations();
        }
    }

    @Override
    public void childRemoved(View child) {
        if (child instanceof RNMGLAnnotationView) {
            updateMarkerAnnotations();
        }
    }

    private void updateMarkerAnnotations() {
        Set<RNMGLAnnotationView> newAnnotationViews = new HashSet<>(_manager.getAnnotationViews(this));
        Set<RNMGLAnnotationView> currentViews = new HashSet<>(_customAnnotationViewMap.values());
        Collection<RNMGLAnnotationView> addedChildren = Sets.difference(newAnnotationViews, currentViews);
        Collection<RNMGLAnnotationView> removedChildren = Sets.difference(currentViews, newAnnotationViews);

        for (RNMGLAnnotationView annotationView : removedChildren) {
            annotationView.removePropertyListener(_propertyListeners.get(annotationView));
            _customAnnotationViewMap.remove(annotationView.getAnnotationId());
            MarkerView markerView = _customAnnodationIds.remove(annotationView.getAnnotationId());
            _map.removeMarker(markerView);
        }

        for (RNMGLAnnotationView annotationView : addedChildren) {
            _customAnnotationViewMap.put(annotationView.getAnnotationId(), annotationView);
            RNMGLCustomMarkerViewOptions options = new RNMGLCustomMarkerViewOptions()
                    .annotationId(annotationView.getAnnotationId())
                    .position(annotationView.getCoordinate())
                    .anchor(0.5f, 0.5f)
                    .flat(true);
            final MarkerView markerView = _map.addMarker(options);
            _customAnnodationIds.put(annotationView.getAnnotationId(), markerView);
            _annotationIdsToName.put(markerView.getId(), annotationView.getAnnotationId());
            RNMGLAnnotationView.PropertyListener propertyListener = new RNMGLAnnotationView.PropertyListener() {
                @Override
                public void propertiesUpdated(RNMGLAnnotationView view) {
                    markerView.setPosition(view.getCoordinate());
                }
            };
            annotationView.addPropertyListener(propertyListener);
            _propertyListeners.put(annotationView, propertyListener);
        }

        relayout();
    }

    private void relayout() {
        // Need a relayout to show custom marker views
        _handler.post(new Runnable() {
            @Override
            public void run() {
                if(_mapView != null) {
                    _mapView.measure(
                            View.MeasureSpec.makeMeasureSpec(_mapView.getMeasuredWidth(), View.MeasureSpec.EXACTLY),
                            View.MeasureSpec.makeMeasureSpec(_mapView.getMeasuredHeight(), View.MeasureSpec.EXACTLY));
                    _mapView.layout(_mapView.getLeft(), _mapView.getTop(), _mapView.getRight(), _mapView.getBottom());
                }
            }
        });
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

    public void setEnableOnRegionDidChange(boolean value) {
        _enableOnRegionDidChange = value;
    }

    public void setEnableOnRegionWillChange(boolean value) {
        _enableOnRegionWillChange = value;
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

    public void setMinimumZoomLevel(double value) {
        if (_minimumZoomLevel == value) { return; }
        _minimumZoomLevel = value;
        if (_map != null) {
            _map.setMinZoom(value);
        }
    }

    public void setMaximumZoomLevel(double value) {
        if (_maximumZoomLevel == value) { return; }
        _maximumZoomLevel = value;
        if (_map != null) {
            _map.setMaxZoom(value);
        }
    }

    public void setPitchEnabled(boolean value) {
        if (_pitchEnabled == value) { return; }
        _pitchEnabled = value;
        if (_map != null) {
            _map.getUiSettings().setTiltGesturesEnabled(value);
        }
    }

    public void setAnnotationsPopUpEnabled(boolean value) {
        _annotationsPopUpEnabled = value;
    }

    public void setStyleURL(String styleURL) {
        if (styleURL.equals(_mapOptions.getStyle())) { return; }
        _mapOptions.styleUrl(styleURL);
        if (_map != null) { _map.setStyleUrl(styleURL); }
    }

    public void setDebugActive(boolean value) {
        if (_mapOptions.getDebugActive() == value) { return; }
        _mapOptions.debugActive(value);
        if (_map != null) { _map.setDebugActive(value); }
    }

    public void setLocationTracking(int value) {
        if (_locationTrackingMode == value) { return; }
        _locationTrackingMode = value;
        if (_map != null) { _map.getTrackingSettings().setMyLocationTrackingMode(value); }
    }

    public void setBearingTracking(int value) {
        if (_bearingTrackingMode == value) { return; }
        _bearingTrackingMode = value;
        if (_map != null) { _map.getTrackingSettings().setMyBearingTrackingMode(value); }
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

    // Events

    void emitEvent(String name, @Nullable WritableMap event) {
        if (event == null) {
            event = Arguments.createMap();
        }
        ((ReactContext)getContext())
                .getJSModule(RCTEventEmitter.class)
                .receiveEvent(getId(), name, event);
    }

    WritableMap serializePoint(LatLng point) {
        PointF screenCoords = _map.getProjection().toScreenLocation(point);

        WritableMap event = Arguments.createMap();
        WritableMap src = Arguments.createMap();
        src.putDouble("latitude", point.getLatitude());
        src.putDouble("longitude", point.getLongitude());
        src.putDouble("screenCoordX", screenCoords.x);
        src.putDouble("screenCoordY", screenCoords.y);
        event.putMap("src", src);
        return event;
    }

    @Override
    public void onMapClick(LatLng point) {
        emitEvent(ReactNativeMapboxGLEventTypes.ON_TAP, serializePoint(point));
    }

    @Override
    public void onMapLongClick(@NonNull LatLng point) {
        emitEvent(ReactNativeMapboxGLEventTypes.ON_LONG_PRESS, serializePoint(point));
    }

    @Override
    public void onMyLocationChange(@Nullable Location location) {
        WritableMap event = Arguments.createMap();
        WritableMap src = Arguments.createMap();

        if (location == null) {
            src.putString("message", "Could not get user location");
            event.putMap("src", src);
            emitEvent(ReactNativeMapboxGLEventTypes.ON_LOCATE_USER_FAILED, event);
            return;
        }

        src.putDouble("latitude", location.getLatitude());
        src.putDouble("longitude", location.getLongitude());

        if (location.hasAccuracy()) {
            src.putDouble("verticalAccuracy", location.getAccuracy());
            src.putDouble("horizontalAccuracy", location.getAccuracy());
        }

        GeomagneticField geoField = new GeomagneticField(
                (float)location.getLatitude(),
                (float)location.getLongitude(),
                location.hasAltitude() ? (float)location.getAltitude() : 0.0f,
                System.currentTimeMillis()
        );

        src.putDouble("magneticHeading", location.getBearing());
        src.putDouble("trueHeading", location.getBearing() + geoField.getDeclination());

        event.putMap("src", src);
        emitEvent(ReactNativeMapboxGLEventTypes.ON_UPDATE_USER_LOCATION, event);
    }

    class TrackingModeChangeRunnable implements Runnable {
        ReactNativeMapboxGLView target;
        TrackingModeChangeRunnable(ReactNativeMapboxGLView target) {
            this.target = target;
        }
        @Override
        public void run() {
            target.onTrackingModeChange();
        }
    }

    public void onTrackingModeChange() {
        if (!_trackingModeUpdateScheduled) { return; }
        _trackingModeUpdateScheduled = false;

        for (int mode = 0; mode < ReactNativeMapboxGLModule.locationTrackingModes.length; mode++) {
            if (_locationTrackingMode == ReactNativeMapboxGLModule.locationTrackingModes[mode] &&
                _bearingTrackingMode == ReactNativeMapboxGLModule.bearingTrackingModes[mode]) {
                WritableMap event = Arguments.createMap();
                event.putInt("src", mode);
                emitEvent(ReactNativeMapboxGLEventTypes.ON_CHANGE_USER_TRACKING_MODE, event);
                break;
            }
        }
    }

    @Override
    @UiThread
    public void onMyBearingTrackingModeChange(int myBearingTrackingMode) {
        if (_bearingTrackingMode == myBearingTrackingMode) { return; }
        _bearingTrackingMode = myBearingTrackingMode;
        _trackingModeUpdateScheduled = true;
        _handler.post(new TrackingModeChangeRunnable(this));

    }

    @Override
    @UiThread
    public void onMyLocationTrackingModeChange(int myLocationTrackingMode) {
        if (_locationTrackingMode == myLocationTrackingMode) { return; }
        _locationTrackingMode = myLocationTrackingMode;
        _trackingModeUpdateScheduled = true;
        _handler.post(new TrackingModeChangeRunnable(this));
    }

    WritableMap serializeCurrentRegion(boolean animated) {
        CameraPosition camera = _map == null
                ? _initialCamera.build()
                : _map.getCameraPosition();

        WritableMap event = Arguments.createMap();
        WritableMap src = Arguments.createMap();
        src.putDouble("longitude", camera.target.getLongitude());
        src.putDouble("latitude", camera.target.getLatitude());
        src.putDouble("zoomLevel", camera.zoom);
        src.putDouble("direction", camera.bearing);
        src.putDouble("pitch", camera.tilt);
        src.putBoolean("animated", animated);
        event.putMap("src", src);
        return event;
    }

    class RegionChangedThrottleRunnable implements Runnable {
        ReactNativeMapboxGLView target;
        RegionChangedThrottleRunnable(ReactNativeMapboxGLView target) {
            this.target = target;
        }
        @Override
        public void run() {
            target.flushRegionChangedThrottle(true);
        }
    }

    private void flushRegionChangedThrottle(boolean fireAgain) {
        _recentlyChanged = false;
        if (_willChangeThrottled) {
            emitEvent(ReactNativeMapboxGLEventTypes.ON_REGION_WILL_CHANGE, serializeCurrentRegion(_changeWasAnimated));
        }
        if (_didChangeThrottled) {
            emitEvent(ReactNativeMapboxGLEventTypes.ON_REGION_DID_CHANGE, serializeCurrentRegion(_changeWasAnimated));
        }

        if (fireAgain && _didChangeThrottled) {
            _recentlyChanged = true;
            _handler.postDelayed(new RegionChangedThrottleRunnable(this), 100);
        }
        _willChangeThrottled = false;
        _didChangeThrottled = false;
    }

    private void onRegionWillChange(boolean animated) {
        if (animated) {
            flushRegionChangedThrottle(false);
        }

        if (_recentlyChanged) {
            _willChangeThrottled = true;
            _changeWasAnimated = animated;
        } else {
            emitEvent(ReactNativeMapboxGLEventTypes.ON_REGION_WILL_CHANGE, serializeCurrentRegion(animated));
        }
    }

    private void onRegionDidChange(boolean animated) {
        if (animated) {
            flushRegionChangedThrottle(false);
        }

        if (_recentlyChanged) {
            _didChangeThrottled = true;
            _changeWasAnimated = animated;
        } else {
            emitEvent(ReactNativeMapboxGLEventTypes.ON_REGION_DID_CHANGE, serializeCurrentRegion(animated));
            _recentlyChanged = true;
            _handler.postDelayed(new RegionChangedThrottleRunnable(this), 100);
        }
    }

    @Override
    public void onMapChanged(int change) {
        switch (change) {
            case MapView.REGION_WILL_CHANGE:
            case MapView.REGION_WILL_CHANGE_ANIMATED:
                if (_enableOnRegionWillChange) {
                    onRegionWillChange(change == MapView.REGION_WILL_CHANGE_ANIMATED);
                }
                break;
            case MapView.REGION_DID_CHANGE:
            case MapView.REGION_DID_CHANGE_ANIMATED:
                if (_enableOnRegionDidChange) {
                    onRegionDidChange(change == MapView.REGION_DID_CHANGE_ANIMATED);
                }
                break;
            case MapView.WILL_START_LOADING_MAP:
                _manager.removeChildListener(this);
                emitEvent(ReactNativeMapboxGLEventTypes.ON_START_LOADING_MAP, null);
                break;
            case MapView.DID_FINISH_LOADING_MAP:
                _manager.addChildListener(this);
                updateMarkerAnnotations();
                emitEvent(ReactNativeMapboxGLEventTypes.ON_FINISH_LOADING_MAP, null);
                break;
        }
    }

    WritableMap serializeMarker(Marker marker) {
        WritableMap event = Arguments.createMap();
        WritableMap src = Arguments.createMap();

        src.putString("id", _annotationIdsToName.get(marker.getId()));
        src.putDouble("longitude", marker.getPosition().getLongitude());
        src.putDouble("latitude", marker.getPosition().getLatitude());
        src.putString("title", marker.getTitle());
        src.putString("subtitle", marker.getSnippet());

        event.putMap("src", src);
        return event;
    }

    @Override
    public boolean onInfoWindowClick(@NonNull Marker marker) {
        emitEvent(ReactNativeMapboxGLEventTypes.ON_RIGHT_ANNOTATION_TAPPED, serializeMarker(marker));
        return false;
    }

    @Override
    public boolean onMarkerClick(@NonNull Marker marker) {
        emitEvent(ReactNativeMapboxGLEventTypes.ON_OPEN_ANNOTATION, serializeMarker(marker));

        if (_annotationsPopUpEnabled == false) { return true; }

        relayout();

        return false;
    }

    // Getters

    public CameraPosition getCameraPosition() {
        if (_map == null) { return _initialCamera.build(); }
        return _map.getCameraPosition();
    }

    public LatLngBounds getBounds() {
        if (_map == null) { return new LatLngBounds.Builder().build(); }
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

    // Annotations

    @Nullable Annotation _removeAnnotation(String name, boolean keep) {
        if (_map == null) {
            _annotationOptions.remove(name);
            return null;
        }
        Annotation annotation = _annotations.remove(name);
        if (annotation == null) { return null; }
        _annotationIdsToName.remove(annotation.getId());

        if (keep) { return annotation; }
        _map.removeAnnotation(annotation);
        return null;
    }

    public void removeAnnotation(String name) {
        _removeAnnotation(name, false);
    }

    public void removeAllAnnotations() {
        _annotationOptions.clear();
        _annotations.clear();
        _annotationIdsToName.clear();
        if (_map != null) {
            _map.removeAnnotations();
        }
    }

    public void setAnnotation(String name, RNMGLAnnotationOptions options) {
        Annotation removed = _removeAnnotation(name, true);

        if (_map == null) {
            _annotationOptions.put(name, options);
        } else {
            Annotation annotation = options.addToMap(_map);
            _annotations.put(name, annotation);
            _annotationIdsToName.put(annotation.getId(), name);
        }

        if (removed != null) { _map.removeAnnotation(removed); }
    }

    public void selectAnnotation(String name, boolean animated) {
        if (_map == null) { return; }
        Annotation annotation = _annotations.get(name);
        if (annotation == null) { return; }
        if (!(annotation instanceof Marker)) { return; }
        Marker marker = (Marker)annotation;
        _map.selectMarker(marker);
    }

    public void deselectAnnotation() {
        if (_map == null) { return; }
        _map.deselectMarkers();
    }

    // Custom Marker View Adapter - Adapts a MarkerView to display an custom react native view.

    private class RNMGLCustomMarkerViewAdapter extends MapboxMap.MarkerViewAdapter<RNMGLCustomMarkerView> {

        RNMGLCustomMarkerViewAdapter(@NonNull Context context) {
            super(context);
        }

        @Nullable
        @Override
        public View getView(@NonNull final RNMGLCustomMarkerView marker, @Nullable View convertView, @NonNull ViewGroup parent) {
            RNMGLAnnotationView reactView = _customAnnotationViewMap.get(marker.getAnnotationId());
            if (reactView.getParent() != null) {
                ViewGroup group = (ViewGroup) reactView.getParent();
                group.removeView(reactView);
            }
            int width = (int)reactView.getLayoutWidth();
            int height = (int)reactView.getLayoutHeight();
            ViewGroup.LayoutParams frameLayoutMeasurements = new FrameLayout.LayoutParams(width, height);
            ViewGroup.LayoutParams viewGroupMeasurements = new ViewGroup.LayoutParams(width, height);

            FrameLayout layout;
            if (convertView == null) {
                layout = new FrameLayout(getContext());
            } else {
                layout = (FrameLayout) convertView;
                layout.removeAllViews();
            }
            reactView.setLayoutParams(viewGroupMeasurements);
            reactView.setOnInterceptTouchEventListener(new OnInterceptTouchEventListener() {
                @Override
                public boolean onInterceptTouchEvent(ViewGroup v, MotionEvent event) {
                    onMarkerClick(marker);
                    return true;
                }
            });
            layout.setLayoutParams(frameLayoutMeasurements);
            layout.addView(reactView);

            relayout();

            return layout;
        }
    }
}
