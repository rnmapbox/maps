package com.mapbox.rctmgl.components.location;

import android.content.Context;
import android.location.Location;

import androidx.annotation.NonNull;

import com.mapbox.android.core.permissions.PermissionsManager;
import com.mapbox.mapboxsdk.location.LocationComponent;
import com.mapbox.mapboxsdk.location.LocationComponentActivationOptions;
import com.mapbox.mapboxsdk.location.LocationComponentOptions;
import com.mapbox.mapboxsdk.location.OnCameraTrackingChangedListener;
import com.mapbox.mapboxsdk.location.modes.CameraMode;
import com.mapbox.mapboxsdk.location.modes.RenderMode;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.Style;
import com.mapbox.rctmgl.R;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.location.LocationManager;
import com.mapbox.rctmgl.location.UserTrackingMode;

/**
 * The LocationComponent on android implements both location tracking and display of user's current location.
 * LocationComponentManager attempts to separate that, so that Camera can ask for location tracking independent of display of user current location.
 * And NativeUserLocation can ask for display of user's current location - independent of Camera's user tracking.
 */
public class LocationComponentManager {
    private RCTMGLMapView mMapView = null;
    private MapboxMap mMap = null;

    private LocationManager mLocationManager = null;
    private LocationComponent mLocationComponent = null;
    private Context mContext = null;

        // state
    private @CameraMode.Mode int mCameraMode = CameraMode.NONE;


    public LocationComponentManager(RCTMGLMapView rctmglMapView, Context context) {
        mMapView = rctmglMapView;
        mMap = mMapView.getMapboxMap();
        mContext = context;

        mLocationManager = LocationManager.getInstance(context);
    }

    private boolean mShowUserLocation = false;


    private boolean mFollowUserLocation = false;

    private boolean mShowingUserLocation = false;

    // TODO revise refactored from Camera

    public void showUserLocation(boolean showUserLocation) {
        mShowUserLocation = showUserLocation;
        stateChanged();
    }

    public void setFollowUserLocation(boolean followUserLocation) {
        mFollowUserLocation = followUserLocation;
        stateChanged();
    }

    public void setCameraMode(@CameraMode.Mode int cameraMode) {
        mLocationComponent.setCameraMode(cameraMode);
    }
    public void addOnCameraTrackingChangedListener(OnCameraTrackingChangedListener onCameraTrackingChangedListener) {
        mLocationComponent.addOnCameraTrackingChangedListener(onCameraTrackingChangedListener);
    }

    private void stateChanged() {
        mLocationComponent.setLocationComponentEnabled((mFollowUserLocation || mShowUserLocation));

        if (mShowingUserLocation != mShowUserLocation) {
            updateShowUserLocation(mShowUserLocation);
        }

        if (mFollowUserLocation) {
            if (!mShowUserLocation) {
                mLocationComponent.setRenderMode(RenderMode.GPS);
            } else {
                //mLocationComponent.setRenderMode(RenderMode.NORMAL); // circle
                mLocationComponent.setRenderMode(RenderMode.COMPASS); // circle with small triangle
                // mLocationComponent.setRenderMode(RenderMode.GPS); // big arrow
            }
            mLocationComponent.onStart();
        } else {
            mLocationComponent.setCameraMode(CameraMode.NONE);
        }
    }

    public boolean hasLocationComponent() {
        return (mLocationComponent != null);
    }

    public void forceLocationUpdate(Location location) {
        mLocationComponent.forceLocationUpdate(location);
    }

    public void update(@NonNull Style style) {
        if (mLocationComponent == null) {
            update(mShowUserLocation, style);
        } else {
            update(mShowUserLocation, style);
        }
    }

    public void update(boolean displayUserLocation, @NonNull Style style) {
        if (mLocationComponent == null) {
            mLocationComponent = mMap.getLocationComponent();

            LocationComponentActivationOptions locationComponentActivationOptions = LocationComponentActivationOptions
                    .builder(mContext, style)
                    .locationComponentOptions(options(displayUserLocation))
                    .build();
            mLocationComponent.activateLocationComponent(locationComponentActivationOptions);
            mLocationComponent.setLocationEngine(mLocationManager.getEngine());
            mShowingUserLocation = displayUserLocation;
        }

        updateShowUserLocation(displayUserLocation);
    }

    private void updateShowUserLocation(boolean displayUserLocation) {
        if (mShowingUserLocation != displayUserLocation) {
            mLocationComponent.applyStyle(options(displayUserLocation));
            mShowingUserLocation = displayUserLocation;
        }
    }


    LocationComponentOptions options(boolean displayUserLocation) {
        LocationComponentOptions.Builder builder = LocationComponentOptions.builder(mContext);
        if (!displayUserLocation) {
            builder = builder
                    .padding(mMap.getPadding())
                    .backgroundDrawable(R.drawable.empty)
                    .backgroundDrawableStale(R.drawable.empty)
                    .bearingDrawable(R.drawable.empty)
                    .foregroundDrawable(R.drawable.empty)
                    .foregroundDrawableStale(R.drawable.empty)
                    .gpsDrawable(R.drawable.empty)
                    .accuracyAlpha(0.0f);
        }
        return builder.build();
    }


    /**
     * 1. implement custom location tracking
     *
     */



    /*

    public void enableLocation() {
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
        if (mLocationComponent == null) {
            mLocationComponent = mMap.getLocationComponent();

            LocationComponentOptions.Builder builder = LocationComponentOptions.builder(mContext);
            if (!mShowUserLocation) {
                builder = builder
                        .padding(mMap.getPadding())
                        .backgroundDrawable(R.drawable.empty)
                        .backgroundDrawableStale(R.drawable.empty)
                        .bearingDrawable(R.drawable.empty)
                        .foregroundDrawable(R.drawable.empty)
                        .foregroundDrawableStale(R.drawable.empty)
                        .gpsDrawable(R.drawable.empty)
                        .accuracyAlpha(0.0f);
            }
            LocationComponentOptions locationComponentOptions = builder.build();

            LocationComponentActivationOptions locationComponentActivationOptions = LocationComponentActivationOptions
                    .builder(mContext, style)
                    .locationComponentOptions(locationComponentOptions)
                    .build();
            mLocationComponent.activateLocationComponent(locationComponentActivationOptions);
            mLocationComponent.setLocationEngine(mLocationManager.getEngine());
        }
        int userLayerMode = UserTrackingMode.getMapLayerMode(mUserLocation.getTrackingMode(), mShowUserLocation);
        mLocationComponent.setLocationComponentEnabled(mFollowUserLocation || mShowUserLocation);

        if (userLayerMode != -1) {
            mLocationComponent.setRenderMode(userLayerMode);
        }
        if (mFollowUserLocation) {
            if (!mShowUserLocation) {
                mLocationComponent.setRenderMode(RenderMode.GPS);
            }
            mLocationComponent.setCameraMode(UserTrackingMode.getCameraMode(mUserTrackingMode));
            mLocationComponent.onStart();
            mLocationComponent.addOnCameraTrackingChangedListener(
                    new OnCameraTrackingChangedListener() {
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
                    }
            );
        } else {
            mLocationComponent.setCameraMode(CameraMode.NONE);
        }
    }
    */

}
