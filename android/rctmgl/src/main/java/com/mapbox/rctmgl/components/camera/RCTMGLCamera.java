package com.mapbox.rctmgl.components.camera;

import android.content.Context;
import android.location.Location;

import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.camera.CameraUpdateFactory;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.VisibleRegion;
import com.mapbox.mapboxsdk.location.modes.CameraMode;
import com.mapbox.mapboxsdk.location.modes.RenderMode;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.Style;
import com.mapbox.mapboxsdk.location.LocationComponent;
import com.mapbox.mapboxsdk.location.LocationComponentOptions;
import com.mapbox.mapboxsdk.location.LocationComponentActivationOptions;
// import com.mapbox.mapboxsdk.plugins.locationlayer.LocationLayerPlugin;
import com.mapbox.mapboxsdk.style.layers.Layer;
import com.mapbox.mapboxsdk.style.layers.Property;
import com.mapbox.mapboxsdk.style.layers.PropertyFactory;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.events.IEvent;
import com.mapbox.rctmgl.events.MapUserTrackingModeEvent;
import com.mapbox.rctmgl.events.MapChangeEvent;
import com.mapbox.rctmgl.location.LocationManager;
import com.mapbox.rctmgl.location.UserLocation;
import com.mapbox.rctmgl.location.UserLocationLayerConstants;
import com.mapbox.rctmgl.location.UserLocationVerticalAlignment;
import com.mapbox.rctmgl.location.UserTrackingMode;
import com.mapbox.rctmgl.location.UserTrackingState;
import com.mapbox.rctmgl.utils.GeoJSONUtils;

import com.mapbox.mapboxsdk.R;

import com.mapbox.rctmgl.events.constants.EventTypes;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import com.mapbox.geojson.Point;

import com.mapbox.android.core.permissions.PermissionsManager;

import android.support.annotation.NonNull;

public class RCTMGLCamera extends AbstractMapFeature {
    private RCTMGLCameraManager mManager;
    private RCTMGLMapView mMapView;

    private boolean hasSentFirstRegion = false;

    private CameraStop mCameraStop;
    private CameraUpdateQueue mCameraUpdateQueue;

    private LocationComponent mLocationComponent;

    private int mUserTrackingMode;
    private int mUserTrackingState = UserTrackingState.POSSIBLE;
    private int mUserLocationVerticalAlignment = UserLocationVerticalAlignment.CENTER;

    public static final int USER_LOCATION_CAMERA_MOVE_DURATION = 1000;

    private LocationManager mLocationManager;
    private UserLocation mUserLocation;
    private boolean mShowUserLocation;

    private Point mCenterCoordinate;

    private boolean mAnimated;
    private double mHeading;
    private double mPitch;
    private double mZoomLevel;

    private double mMinZoomLevel = -1;
    private double mMaxZoomLevel = -1;

    private boolean mFollowUserLocation;
    private String mFollowUserMode;

    private Context mContext;


    private LocationManager.OnUserLocationChange mLocationChangeListener = new LocationManager.OnUserLocationChange() {
        @Override
        public void onLocationChange(Location nextLocation) {
            if (getMapboxMap() == null || mLocationComponent == null || !mShowUserLocation) {
                return;
            }

            float distToNextLocation = mUserLocation.getDistance(nextLocation);
            mLocationComponent.forceLocationUpdate(nextLocation); // FMTODO - use builtin location tracking.
            mUserLocation.setCurrentLocation(nextLocation);

            if (mUserTrackingState == UserTrackingState.POSSIBLE || distToNextLocation > 0.0f) {
                updateUserLocation(true);
            }
            sendUserLocationUpdateEvent(nextLocation);
        }
    };

    private MapboxMap.CancelableCallback mCameraCallback = new MapboxMap.CancelableCallback() {
        @Override
        public void onCancel() {
            if (!hasSentFirstRegion) {
                mMapView.sendRegionChangeEvent(false);
                hasSentFirstRegion = true;
            }
        }

        @Override
        public void onFinish() {
            if (!hasSentFirstRegion) {
                mMapView.sendRegionChangeEvent(false);
                hasSentFirstRegion = true;
            }
        }
    };

    public RCTMGLCamera(Context context, RCTMGLCameraManager manager) {
        super(context);
        mContext = context;
        mManager = manager;
        mCameraUpdateQueue = new CameraUpdateQueue();

        mUserLocation = new UserLocation();
        mLocationManager = LocationManager.getInstance(context);
    }

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        mMapView = mapView;

        if (mCameraStop != null) {
            updateCamera();
        }
        updateMaxMinZoomLevel();

        if (mShowUserLocation) {
            enableLocation();
        }
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {

    }

    public void setStop(CameraStop stop) {
        mCameraStop = stop;
        mCameraStop.setCallback(mCameraCallback);

        if (mMapView != null) {
            updateCamera();
        }
    }

    private void updateMaxMinZoomLevel() {
        MapboxMap map = getMapboxMap();
        if (map != null) {
            if (mMinZoomLevel >= 0.0) {
                map.setMinZoomPreference(mMinZoomLevel);
            }
            if (mMaxZoomLevel >= 0.0) {
                map.setMaxZoomPreference(mMaxZoomLevel);
            }
        }
    }

    private void updateCamera() {
        mCameraUpdateQueue.offer(mCameraStop);
        mCameraUpdateQueue.execute(mMapView.getMapboxMap());
    }

    private void updateUserTrackingMode(int userTrackingMode) {
        mUserLocation.setTrackingMode(userTrackingMode);
        IEvent event = new MapUserTrackingModeEvent(this, userTrackingMode);
        mManager.handleEvent(event);
    }

    private void updateUserLocation(boolean isAnimated) {
        if (!mShowUserLocation || mUserLocation.getTrackingMode() == UserTrackingMode.NONE) {
            return;
        }

        if (mUserTrackingState == UserTrackingState.POSSIBLE) {
            updateUserLocationSignificantly(isAnimated);
        } else if (mUserTrackingState == UserTrackingState.CHANGED) {
            updateUserLocationIncrementally(isAnimated);
        }
    }

    private CameraPosition getUserLocationUpdateCameraPosition(double zoomLevel) {
        LatLng center = mUserLocation.getCoordinate();

        if (mUserLocationVerticalAlignment != UserLocationVerticalAlignment.CENTER) {
            VisibleRegion region = mMapView.getVisibleRegion(center, zoomLevel);

            switch (mUserLocationVerticalAlignment) {
                case UserLocationVerticalAlignment.TOP:
                    center = new LatLng(region.nearRight.getLatitude(), center.getLongitude());
                    break;
                case UserLocationVerticalAlignment.BOTTOM:
                    center = new LatLng(region.farLeft.getLatitude(), center.getLongitude());
                    break;
            }
        }

        return new CameraPosition.Builder()
                .target(center)
                .bearing(getDirectionForUserLocationUpdate())
                .tilt(mPitch)
                .zoom(zoomLevel)
                .build();
    }

    private double getDirectionForUserLocationUpdate() {
        // NOTE: The direction of this is used for map rotation only, not location layer rotation
        CameraPosition currentCamera = mMapView.getCameraPosition();
        double direction = currentCamera.bearing;

        int userTrackingMode = mUserLocation.getTrackingMode();
        if (userTrackingMode == UserTrackingMode.FollowWithHeading || userTrackingMode == UserTrackingMode.FollowWithCourse) {
            direction = mUserLocation.getBearing();
        } else if (mHeading != 0.0) {
            direction = mHeading;
        }

        return direction;
    }

    private void sendUserLocationUpdateEvent(Location location) {
        if(location == null){
            return;
        }
        IEvent event = new MapChangeEvent(this, makeLocationChangePayload(location), EventTypes.USER_LOCATION_UPDATED);
        mManager.handleEvent(event);
    }

    private boolean hasSetCenterCoordinate() {
        CameraPosition cameraPosition = mMapView.getCameraPosition();
        LatLng center = cameraPosition.target;
        return center.getLatitude() != 0.0 && center.getLongitude() != 0.0;
    }


    private void updateUserLocationSignificantly(boolean isAnimated) {
        mUserTrackingState = UserTrackingState.BEGAN;

        CameraUpdate cameraUpdate = CameraUpdateFactory.newCameraPosition(getUserLocationUpdateCameraPosition(mZoomLevel));
        MapboxMap.CancelableCallback cameraCallback = new MapboxMap.CancelableCallback() {
            @Override
            public void onCancel() {
                mUserTrackingState = UserTrackingState.CHANGED;
            }

            @Override
            public void onFinish() {
                mUserTrackingState = UserTrackingState.CHANGED;
            }
        };

        if (isAnimated && hasSetCenterCoordinate()) {
            mMapView.animateCamera(cameraUpdate, cameraCallback);
        } else {
            mMapView.moveCamera(cameraUpdate, cameraCallback);
        }
    }

    private void updateUserLocationIncrementally(boolean isAnimated) {
        mUserTrackingState = UserTrackingState.BEGAN;

        CameraPosition cameraPosition = mMapView.getCameraPosition();
        CameraUpdate cameraUpdate = CameraUpdateFactory.newCameraPosition(getUserLocationUpdateCameraPosition(cameraPosition.zoom));

        MapboxMap.CancelableCallback callback = new MapboxMap.CancelableCallback() {
            @Override
            public void onCancel() {
                mUserTrackingState = UserTrackingState.CHANGED;
            }

            @Override
            public void onFinish() {
                mUserTrackingState = UserTrackingState.CHANGED;
            }
        };

        if (isAnimated) {
            mMapView.easeCamera(cameraUpdate, USER_LOCATION_CAMERA_MOVE_DURATION, callback);
        } else {
            mMapView.moveCamera(cameraUpdate, callback);
        }
    }

    public void setReactUserTrackingMode(int userTrackingMode) {
        int oldTrackingMode = mUserTrackingMode;
        mUserTrackingMode = userTrackingMode;
        updateUserTrackingMode(userTrackingMode);

        switch (mUserTrackingMode) {
            case UserTrackingMode.NONE:
                mUserTrackingState = UserTrackingState.POSSIBLE;
                break;
            case UserTrackingMode.FOLLOW:
            case UserTrackingMode.FollowWithCourse:
            case UserTrackingMode.FollowWithHeading:
                if (oldTrackingMode == UserTrackingMode.NONE) {
                    mUserTrackingState = UserTrackingState.POSSIBLE;
                }
                mShowUserLocation = true;
                break;

        }

        if (mMapView != null) {
            updateUserLocation(false);
            updateLocationLayer(mMapView.getMapboxMap().getStyle());
        }
    }

    private void enableLocation() {
        if (!PermissionsManager.areLocationPermissionsGranted(mContext)) {
            return;
        }

        if (!mLocationManager.isActive()) {
            mLocationManager.enable();
        }

        mMapView.getMapboxMap().getStyle(new Style.OnStyleLoaded() {
            @Override
            public void onStyleLoaded(@NonNull Style style) {
                enableLocationComponent(style);
            }
        });
    }

    private void enableLocationComponent(@NonNull Style style) {
        updateLocationLayer(style);

        Location lastKnownLocation = mLocationManager.getLastKnownLocation();
        mLocationManager.addLocationListener(mLocationChangeListener);

        if (lastKnownLocation != null) {
            mLocationChangeListener.onLocationChange(lastKnownLocation);

            postDelayed(new Runnable() {
                @Override
                public void run() {
                    mMapView.sendRegionDidChangeEvent();
                }
            }, 200);
        }

    }

    private void updateLocationLayer(@NonNull Style style) {
        if (mLocationComponent == null) {
            mLocationComponent = getMapboxMap().getLocationComponent();
        }

        LocationComponentOptions locationComponentOptions = LocationComponentOptions.builder(mContext)
                    .build();

        LocationComponentActivationOptions locationComponentActivationOptions = LocationComponentActivationOptions
                .builder(mContext, style)
                .locationComponentOptions(locationComponentOptions)
                .build();
        mLocationComponent.activateLocationComponent(locationComponentActivationOptions);
        mLocationComponent.setLocationEngine(mLocationManager.getEngine());

        int userLayerMode = UserTrackingMode.getMapLayerMode(mUserLocation.getTrackingMode(), mShowUserLocation);
        mLocationComponent.setLocationComponentEnabled(userLayerMode != -1);

        if (userLayerMode != -1) {
            mLocationComponent.setRenderMode(userLayerMode);
        }
    }

    public void setMinZoomLevel(double zoomLevel) {
        mMinZoomLevel = zoomLevel;
        updateMaxMinZoomLevel();
    }

    public void setMaxZoomLevel(double zoomLevel) {
        mMaxZoomLevel = zoomLevel;
        updateMaxMinZoomLevel();
    }

    public void setZoomLevel(double zoomLevel) {
        mZoomLevel = zoomLevel;
        updateCameraPositionIfNeeded(false);
    }

    private CameraPosition buildCamera(CameraPosition previousPosition, boolean shouldUpdateTarget) {
        CameraPosition.Builder builder = new CameraPosition.Builder(previousPosition)
                .bearing(mHeading)
                .tilt(mPitch)
                .zoom(mZoomLevel);

        if (shouldUpdateTarget) {
            builder.target(GeoJSONUtils.toLatLng(mCenterCoordinate));
        }

        return builder.build();
    }

    private void updateCameraPositionIfNeeded(boolean shouldUpdateTarget) {
        if (mMapView != null) {
            CameraPosition prevPosition = mMapView.getCameraPosition();
            CameraUpdate cameraUpdate = CameraUpdateFactory.newCameraPosition(buildCamera(prevPosition, shouldUpdateTarget));

            if (mAnimated) {
                mMapView.easeCamera(cameraUpdate);
            } else {
                mMapView.moveCamera(cameraUpdate);
            }
        }
    }

    public void setUserTrackingMode(int userTrackingMode) {
        int oldTrackingMode = mUserTrackingMode;
        mUserTrackingMode = userTrackingMode;
        updateUserTrackingMode(userTrackingMode);

        switch (mUserTrackingMode) {
            case UserTrackingMode.NONE:
                mUserTrackingState = UserTrackingState.POSSIBLE;
                break;
            case UserTrackingMode.FOLLOW:
            case UserTrackingMode.FollowWithCourse:
            case UserTrackingMode.FollowWithHeading:
                if (oldTrackingMode == UserTrackingMode.NONE) {
                    mUserTrackingState = UserTrackingState.POSSIBLE;
                }
                mShowUserLocation = true;
                break;

        }

        if (getMapboxMap() != null) {
            updateUserLocation(false);
            updateLocationLayer(getMapboxMap().getStyle());
        }
    }


    public void setFollowUserLocation(boolean value) {
        mFollowUserLocation = value;
        if (value) {
            setUserTrackingMode(UserTrackingMode.FOLLOW);
        } else {
            setUserTrackingMode(UserTrackingMode.NONE);
        }
    }

    public void setFollowUserMode(String mode) {
        mFollowUserMode = mode;

    }

    MapboxMap getMapboxMap() {
        if (mMapView == null) {
            return null;
        }
        return mMapView.getMapboxMap();
    }

    /**
     * Create a payload of the location data per the web api geolocation spec
     * https://dev.w3.org/geo/api/spec-source.html#position
     * @return
     */
    private WritableMap makeLocationChangePayload(Location location) {
        WritableMap positionProperties = new WritableNativeMap();
        WritableMap coords = new WritableNativeMap();

        coords.putDouble("longitude", location.getLongitude());
        coords.putDouble("latitude", location.getLatitude());
        coords.putDouble("altitude", location.getAltitude());
        coords.putDouble("accuracy", location.getAccuracy());
        coords.putDouble("heading", location.getBearing());
        coords.putDouble("speed", location.getSpeed());

        positionProperties.putMap("coords", coords);
        positionProperties.putDouble("timestamp", location.getTime());
        return positionProperties;
    }
}
