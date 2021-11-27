package com.mapbox.rctmgl.components.camera;

import android.animation.Animator;
import android.content.Context;
import android.location.Location;

/*
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.camera.CameraUpdateFactory;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.LatLngBounds;
import com.mapbox.mapboxsdk.geometry.VisibleRegion;
import com.mapbox.mapboxsdk.location.OnCameraTrackingChangedListener;
import com.mapbox.mapboxsdk.location.modes.CameraMode;
import com.mapbox.mapboxsdk.location.modes.RenderMode;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.Style;
import com.mapbox.mapboxsdk.location.LocationComponent;
import com.mapbox.mapboxsdk.location.LocationComponentOptions;
import com.mapbox.mapboxsdk.location.LocationComponentActivationOptions;
*?
 */
// import com.mapbox.mapboxsdk.plugins.locationlayer.LocationLayerPlugin;
// import com.mapbox.maps.CameraOptions;
import com.mapbox.maps.CameraBounds;
import com.mapbox.maps.CameraOptions;
import com.mapbox.maps.CameraState;
import com.mapbox.maps.CoordinateBounds;
import com.mapbox.maps.ExtensionUtils;
import com.mapbox.maps.MapboxMap;
import com.mapbox.maps.ScreenCoordinate;
import com.mapbox.maps.Style;
import com.mapbox.maps.plugin.animation.CameraAnimationsPlugin;
import com.mapbox.maps.plugin.animation.CameraAnimationsUtils;
import com.mapbox.maps.plugin.animation.CameraOptionsUtilsKt;
import com.mapbox.maps.plugin.animation.MapAnimationOptions;
import com.mapbox.maps.plugin.delegates.MapPluginProviderDelegate;
import com.mapbox.maps.plugin.gestures.GesturesUtils;
import com.mapbox.maps.plugin.locationcomponent.LocationComponentPlugin;
import com.mapbox.maps.plugin.locationcomponent.LocationComponentUtils;
import com.mapbox.maps.plugin.locationcomponent.OnIndicatorBearingChangedListener;
import com.mapbox.maps.plugin.locationcomponent.OnIndicatorPositionChangedListener;
import com.mapbox.rctmgl.components.AbstractMapFeature;
// import com.mapbox.rctmgl.components.location.LocationComponentManager;
import com.mapbox.rctmgl.components.camera.constants.CameraMode;
import com.mapbox.rctmgl.components.location.LocationComponentManager;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.events.IEvent;
//import com.mapbox.rctmgl.events.MapUserTrackingModeEvent;
//import com.mapbox.rctmgl.events.MapChangeEvent;
// import com.mapbox.rctmgl.location.LocationManager;
// import com.mapbox.rctmgl.location.UserLocation;
// import com.mapbox.rctmgl.location.UserLocationVerticalAlignment;
// import com.mapbox.rctmgl.location.UserTrackingMode;
// import com.mapbox.rctmgl.location.UserTrackingState;
// import com.mapbox.rctmgl.utils.GeoJSONUtils;

import com.mapbox.rctmgl.R;

// import com.mapbox.rctmgl.events.constants.EventTypes;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import com.mapbox.geojson.Point;

import com.mapbox.android.core.permissions.PermissionsManager;
import com.mapbox.rctmgl.events.MapChangeEvent;
import com.mapbox.rctmgl.events.constants.EventTypes;
import com.mapbox.rctmgl.location.LocationManager;
import com.mapbox.rctmgl.location.UserLocation;
import com.mapbox.rctmgl.location.UserLocationVerticalAlignment;
import com.mapbox.rctmgl.location.UserTrackingMode;
import com.mapbox.rctmgl.location.UserTrackingState;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.rctmgl.utils.LatLng;
import com.mapbox.rctmgl.utils.LatLngBounds;

import androidx.annotation.NonNull;

import kotlin.jvm.functions.Function1;

public class RCTMGLCamera extends AbstractMapFeature {
    private RCTMGLCameraManager mManager;
    private RCTMGLMapView mMapView;

    private boolean hasSentFirstRegion = false;

    private CameraStop mDefaultStop;

    private CameraStop mCameraStop;
    private CameraUpdateQueue mCameraUpdateQueue;

    /*
    // private LocationComponent mLocationComponent;
     */
    private LocationComponentManager mLocationComponentManager;

    private int mUserTrackingMode;
    private int mUserTrackingState = UserTrackingState.POSSIBLE;
    private int mUserLocationVerticalAlignment = UserLocationVerticalAlignment.CENTER;

    public static final int USER_LOCATION_CAMERA_MOVE_DURATION = 1000;

    private LocationManager mLocationManager;
    private UserLocation mUserLocation;
    private ScreenCoordinate mCenterCoordinate;

    private boolean mAnimated;
    private double mHeading;
    private double mPitch;
    private double mZoomLevel = -1;

    private double mMinZoomLevel = -1;
    private double mMaxZoomLevel = -1;

    private LatLngBounds mMaxBounds;

    private boolean mFollowUserLocation;
    private String mFollowUserMode;

    private Context mContext;

    private LocationManager.OnUserLocationChange mLocationChangeListener = new LocationManager.OnUserLocationChange() {
        @Override
        public void onLocationChange(Location nextLocation) {
        if (getMapboxMap() == null || mLocationComponentManager == null || !mLocationComponentManager.hasLocationComponent() || (!mFollowUserLocation)) {
            return;
        }

        mUserLocation.setCurrentLocation(nextLocation);
        sendUserLocationUpdateEvent(GeoJSONUtils.toPoint(nextLocation));
        }
    };

    private OnIndicatorBearingChangedListener mLocationBearingChangedListener = new OnIndicatorBearingChangedListener() {
        @Override
        public void onIndicatorBearingChanged(double v) {
            if (mFollowUserLocation) {
                mMapView.getMapboxMap().setCamera(new CameraOptions.Builder().bearing(v).build());
            }
        }
    };

    private OnIndicatorPositionChangedListener mLocationPositionChangeListener = new OnIndicatorPositionChangedListener() {
        @Override
        public void onIndicatorPositionChanged(@NonNull Point point) {
            if (mFollowUserLocation) {
                mMapView.getMapboxMap().setCamera(new CameraOptions.Builder().center(point).build());
                GesturesUtils.getGestures(mMapView).setFocalPoint(mMapView.getMapboxMap().pixelForCoordinate(point));

                sendUserLocationUpdateEvent(point);
            }
        }
    };


    private Animator.AnimatorListener mCameraCallback = new Animator.AnimatorListener() {
        @Override
        public void onAnimationStart(Animator animator) {

        }

        @Override
        public void onAnimationEnd(Animator animator) {
            if (!hasSentFirstRegion) {
                mMapView.sendRegionChangeEvent(false);
                hasSentFirstRegion = true;
            }
        }

        @Override
        public void onAnimationCancel(Animator animator) {
            if (!hasSentFirstRegion) {
                mMapView.sendRegionChangeEvent(false);
                hasSentFirstRegion = true;
            }
        }

        @Override
        public void onAnimationRepeat(Animator animator) {

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

        setInitialCamera();
        updateMaxMinZoomLevel();
        updateMaxBounds();

        if (mCameraStop != null) {
            updateCamera();
        }

        if (mFollowUserLocation) {
            // updateFollowLocation(mFollowUserLocation);
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

    public void setDefaultStop(CameraStop stop) {
        mDefaultStop = stop;
    }

    public void setFollowPitch(double pitch) {
        mPitch = pitch;
//        updateCameraPositionIfNeeded(true);
    }

    public void setMaxBounds(LatLngBounds bounds) {
        mMaxBounds = bounds;
        updateMaxBounds();
    }

    private void updateMaxBounds() {
        /*
        MapboxMap map = getMapboxMap();
        if (map != null && mMaxBounds != null) {
            map.setLatLngBoundsForCameraTarget(mMaxBounds);
        }

         */
    }

    private void updateMaxMinZoomLevel() {
        /*
        MapboxMap map = getMapboxMap();
        if (map != null) {
            if (mMinZoomLevel >= 0.0) {
                map.setMinZoomPreference(mMinZoomLevel);
            }
            if (mMaxZoomLevel >= 0.0) {
                map.setMaxZoomPreference(mMaxZoomLevel);
            }
        }*/
    }

    private void setInitialCamera() {
        MapboxMap map = mMapView.getMapboxMap();

        if (mDefaultStop != null) {
            mDefaultStop.setDuration(0);
            mDefaultStop.setMode(com.mapbox.rctmgl.components.camera.constants.CameraMode.NONE);
            CameraUpdateItem item = mDefaultStop.toCameraUpdate(mMapView);
            item.run();
        }
    }

    private void updateCamera() {
        mCameraUpdateQueue.offer(mCameraStop);
        mCameraUpdateQueue.execute(mMapView);
    }

    private void updateUserTrackingMode(int userTrackingMode) {
        /* v10todo
        mUserLocation.setTrackingMode(userTrackingMode);
        IEvent event = new MapUserTrackingModeEvent(this, userTrackingMode);
        mManager.handleEvent(event);
         */
    }

    private void updateUserLocation(boolean isAnimated) {
        if ((!mFollowUserLocation) || mUserLocation.getTrackingMode() == UserTrackingMode.NONE) {
            return;
        }

        if (mUserTrackingState == UserTrackingState.POSSIBLE) {
            updateUserLocationSignificantly(isAnimated);
        } else if (mUserTrackingState == UserTrackingState.CHANGED) {
            updateUserLocationIncrementally(isAnimated);
        }
    }

    private CameraOptions getUserLocationUpdateCameraOptions(double zoomLevel) {
        LatLng center = mUserLocation.getCoordinate();

        ScreenCoordinate anchor = CameraAnimationsUtils.getCamera(mMapView).getAnchor();
        CameraState actState = mMapView.getMapboxMap().getCameraState();
        if (mUserLocationVerticalAlignment != UserLocationVerticalAlignment.CENTER) {
            CameraOptions options = ExtensionUtils.toCameraOptions(actState, anchor);


            CoordinateBounds bounds = mMapView.getMapboxMap().coordinateBoundsForCamera(options);

            //VisibleRegion region = mMapView.getVisibleRegion(center, zoomLevel);

            switch (mUserLocationVerticalAlignment) {
                case UserLocationVerticalAlignment.TOP:
                    center = new LatLng(bounds.getNortheast().latitude(), center.getLongitude());
                    break;
                case UserLocationVerticalAlignment.BOTTOM:
                    center = new LatLng(bounds.getSouthwest().latitude(), center.getLongitude());
                    break;
            }
        }

        return new CameraOptions.Builder()
                .center(center.getPoint())
                .bearing(getDirectionForUserLocationUpdate())
                .pitch(mPitch)
                .anchor(anchor)
                .padding(actState.getPadding())
                .zoom(zoomLevel)
                .build();
    }

    private double getDirectionForUserLocationUpdate() {
        // NOTE: The direction of this is used for map rotation only, not location layer rotation

        CameraState currentCamera = mMapView.getMapboxMap().getCameraState();
        double direction = currentCamera.getBearing();

        int userTrackingMode = mUserLocation.getTrackingMode();
        if (userTrackingMode == UserTrackingMode.FollowWithHeading || userTrackingMode == UserTrackingMode.FollowWithCourse) {
            direction = mUserLocation.getBearing();
        } else if (mHeading != 0.0) {
            direction = mHeading;
        }

        return direction;
    }


    private void sendUserLocationUpdateEvent(Point point) {
        if (point == null) {
            return;
        }
        IEvent event = new MapChangeEvent(this, EventTypes.USER_LOCATION_UPDATED, makeLocationChangePayload(GeoJSONUtils.toLocation(point)));
        mManager.handleEvent(event);
    }

    private boolean hasSetCenterCoordinate() {
        CameraState state = getMapboxMap().getCameraState();
        Point center = state.getCenter();
        return center.latitude() != 0.0 && center.longitude() != 0.0;
    }

    static final double minimumZoomLevelForUserTracking = 10.5;
    static final double defaultZoomLevelForUserTracking = 14.0;

    private void updateUserLocationSignificantly(boolean isAnimated) {
        mUserTrackingState = UserTrackingState.BEGAN;

        double zoom = mZoomLevel;
        if (zoom < 0) {
            double camerZoom = mMapView.getMapboxMap().getCameraState().getZoom();
            if (camerZoom < minimumZoomLevelForUserTracking) {
                zoom = defaultZoomLevelForUserTracking;
            } else {
                zoom = camerZoom;
            }
        }

        CameraOptions.Builder builder = new CameraOptions.Builder();
        CameraState currentCamera = mMapView.getMapboxMap().getCameraState();

        CameraOptions cameraOptions = getUserLocationUpdateCameraOptions(zoom);

        MapAnimationOptions.Builder animationOptions = new MapAnimationOptions.Builder().animatorListener(new Animator.AnimatorListener() {
            @Override
            public void onAnimationStart(Animator animation) {

            }

            @Override
            public void onAnimationEnd(Animator animation) {
                mUserTrackingState = UserTrackingState.CHANGED;
            }

            @Override
            public void onAnimationCancel(Animator animation) {
                mUserTrackingState = UserTrackingState.CHANGED;
            }

            @Override
            public void onAnimationRepeat(Animator animation) {

            }
        });
        if (isAnimated && hasSetCenterCoordinate()) {
            CameraAnimationsUtils.flyTo(getMapboxMap(), cameraOptions, animationOptions.build());
        } else {
            CameraAnimationsUtils.flyTo(getMapboxMap(), cameraOptions, animationOptions.duration(0).build());
        }

    }

    private void updateUserLocationIncrementally(boolean isAnimated) {
        mUserTrackingState = UserTrackingState.BEGAN;

        CameraState cameraState = getMapboxMap().getCameraState();

        CameraOptions cameraOptions = getUserLocationUpdateCameraOptions(cameraState.getZoom());

        MapAnimationOptions.Builder animationOptions = new MapAnimationOptions.Builder().animatorListener(new Animator.AnimatorListener() {
            @Override
            public void onAnimationStart(Animator animation) {

            }

            @Override
            public void onAnimationEnd(Animator animation) {
                mUserTrackingState = UserTrackingState.CHANGED;
            }

            @Override
            public void onAnimationCancel(Animator animation) {
                mUserTrackingState = UserTrackingState.CHANGED;
            }

            @Override
            public void onAnimationRepeat(Animator animation) {

            }
        });
        if (isAnimated) {
            animationOptions.duration(USER_LOCATION_CAMERA_MOVE_DURATION);
        } else {
            animationOptions.duration(0);
        }

        CameraAnimationsUtils.flyTo(getMapboxMap(), cameraOptions, animationOptions.build());
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
/*
    void updateFollowLocation(boolean follow) {
        LocationComponentPlugin locationComponent = LocationComponentUtils.getLocationComponent(mMapView);
        if (follow) {
            locationComponent.setEnabled(true);
            locationComponent.addOnIndicatorBearingChangedListener(mLocationBearingChangedListener);
            locationComponent.addOnIndicatorPositionChangedListener(mLocationPositionChangeListener);
        } else {
            locationComponent.removeOnIndicatorBearingChangedListener(mLocationBearingChangedListener);
            locationComponent.removeOnIndicatorPositionChangedListener(mLocationPositionChangeListener);
        }
    } */

    private void enableLocationComponent(@NonNull Style style) {
        updateUserLocation(false);
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
        if (mLocationComponentManager == null) {
            mLocationComponentManager = mMapView.getLocationComponentManager();
        }

        mLocationComponentManager.update(style);

        if (mFollowUserLocation) {
            mLocationComponentManager.setCameraMode(UserTrackingMode.getCameraMode(mUserTrackingMode));
        }
        mLocationComponentManager.setFollowUserLocation(mFollowUserLocation);

        if (mFollowUserLocation) {
            mLocationComponentManager.setCameraMode(UserTrackingMode.getCameraMode(mUserTrackingMode));

            /*
            mLocationComponentManager.addOnCameraTrackingChangedListener(new OnCameraTrackingChangedListener() {
                    @Override public void onCameraTrackingChanged(int currentMode) {
                        int userTrackingMode = UserTrackingMode.NONE;
                        switch (currentMode) {
                            case CameraMode.NONE:
                                userTrackingMode = UserTrackingMode.NONE;
                                break;
                            case CameraMode.TRACKING:
                                userTrackingMode = UserTrackingMode.FOLLOW;
                                break;
                            case CameraMode.TRACKING_COMPASS:
                                userTrackingMode = UserTrackingMode.FollowWithHeading;
                                break;
                            case CameraMode.TRACKING_GPS:
                                userTrackingMode = UserTrackingMode.FollowWithCourse;
                                break;
                            default:
                                userTrackingMode = UserTrackingMode.NONE;
                        }
                        updateUserTrackingMode(userTrackingMode);
                    }
                    @Override public void onCameraTrackingDismissed() {
                    }
            });
             */
        } else {
            mLocationComponentManager.setCameraMode(CameraMode.NONE);
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

    private CameraOptions buildCamera(CameraState previousPosition, boolean shouldUpdateTarget) {
        if (shouldUpdateTarget) {
            return ExtensionUtils.toCameraOptions(previousPosition, mCenterCoordinate);
        } else {
            return ExtensionUtils.toCameraOptions(previousPosition, null);
        }
    }

    private void updateCameraPositionIfNeeded(boolean shouldUpdateTarget) {
        if (mMapView != null) {
            CameraState prevPosition = getMapboxMap().getCameraState();
            CameraOptions cameraUpdate = /*CameraUpdateFactory.newCameraPosition(*/buildCamera(prevPosition, shouldUpdateTarget);

            if (mAnimated) {
                getMapboxMap().cameraAnimationsPlugin(new Function1<CameraAnimationsPlugin, Object>() {
                    public Object invoke(CameraAnimationsPlugin plugin) {
                        plugin.flyTo(cameraUpdate, null);
                        return null;
                    }
                });
            } else {
                getMapboxMap().setCamera(cameraUpdate);
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
                break;

        }

        if (getMapboxMap() != null) {
            updateLocationLayer(getMapboxMap().getStyle());
        }
    }


    public void setFollowUserLocation(boolean value) {
        mFollowUserLocation = value;
        updatedFollowUserMode();
    }

    public void setFollowUserMode(String mode) {
        mFollowUserMode = mode;
        updatedFollowUserMode();
    }

    private void updatedFollowUserMode() {
        if (mFollowUserLocation) {
            setUserTrackingMode(UserTrackingMode.fromString(mFollowUserMode));
        } else {
            setUserTrackingMode(UserTrackingMode.NONE);
        }
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
     *
     * @return
     */
    private WritableMap makeLocationChangePayload(Location location) {
        WritableMap positionProperties = new WritableNativeMap();
        WritableMap coords = new WritableNativeMap();

        coords.putDouble("longitude", location.getLongitude());
        coords.putDouble("latitude", location.getLatitude());
        coords.putDouble("altitude", location.getAltitude());
        coords.putDouble("accuracy", location.getAccuracy());
        // A better solution will be to pull the heading from the compass engine, 
        // unfortunately the api is not publicly available in the mapbox sdk
        coords.putDouble("heading", location.getBearing());
        coords.putDouble("course", location.getBearing());
        coords.putDouble("speed", location.getSpeed());

        positionProperties.putMap("coords", coords);
        positionProperties.putDouble("timestamp", location.getTime());
        return positionProperties;
    }
}