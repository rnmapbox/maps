package com.mapbox.rctmgl.components.location;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.graphics.LightingColorFilter;
import android.graphics.drawable.Drawable;

import com.mapbox.geojson.Point;
import com.mapbox.maps.CameraOptions;
import com.mapbox.maps.MapboxMap;
import com.mapbox.maps.Style;
import com.mapbox.maps.plugin.LocationPuck;
import com.mapbox.maps.plugin.LocationPuck2D;
import com.mapbox.maps.plugin.gestures.GesturesUtils;
import com.mapbox.maps.plugin.locationcomponent.LocationComponentPlugin;
import com.mapbox.maps.plugin.locationcomponent.LocationComponentUtils;
import com.mapbox.maps.plugin.locationcomponent.OnIndicatorBearingChangedListener;
import com.mapbox.maps.plugin.locationcomponent.OnIndicatorPositionChangedListener;
import com.mapbox.maps.plugin.locationcomponent.generated.LocationComponentSettings;
import com.mapbox.rctmgl.R;
import com.mapbox.rctmgl.components.location.CameraMode;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.location.LocationManager;
import com.mapbox.rctmgl.utils.Logger;

import androidx.annotation.NonNull;
import androidx.appcompat.content.res.AppCompatResources;

/**
 * The LocationComponent on android implements both location tracking and display of user's current location.
 * LocationComponentManager attempts to separate that, so that Camera can ask for location tracking independent of display of user current location.
 * And NativeUserLocation can ask for display of user's current location - independent of Camera's user tracking.
 */
public class LocationComponentManager {
    private RCTMGLMapView mMapView = null;
    private MapboxMap mMap = null;

    private LocationManager mLocationManager = null;
    private LocationComponentPlugin mLocationComponent = null;
    private Context mContext = null;

    private int mCameraMode = CameraMode.NONE;

    private @RenderMode.Mode int mRenderMode = RenderMode.COMPASS;

    private OnIndicatorBearingChangedListener mLocationBearingChangedListener = new OnIndicatorBearingChangedListener() {
        @Override
        public void onIndicatorBearingChanged(double v) {
            if (mFollowUserLocation) {
                mMapView.getMapboxMap().setCamera(new CameraOptions.Builder().bearing(v).build());
            }
        }
    };
    private boolean bearingListenerInstalled = false;

    private OnIndicatorPositionChangedListener mLocationPositionChangeListener = new OnIndicatorPositionChangedListener() {
        @Override
        public void onIndicatorPositionChanged(@NonNull Point point) {
            if (mFollowUserLocation) {
                mMapView.getMapboxMap().setCamera(new CameraOptions.Builder().center(point).build());
                GesturesUtils.getGestures(mMapView).setFocalPoint(mMapView.getMapboxMap().pixelForCoordinate(point));

                // sendUserLocationUpdateEvent(point);
            }
        }
    };

    public LocationComponentManager(RCTMGLMapView rctmglMapView, Context context) {
        mMapView = rctmglMapView;
        mMap = mMapView.getMapboxMap();
        mContext = context;

        mLocationManager = LocationManager.getInstance(context);
    }

    private boolean mShowUserLocation = false;

    private boolean mFollowUserLocation = false;

    private boolean mShowingUserLocation = false;

    public void showUserLocation(boolean showUserLocation) {
        mShowUserLocation = showUserLocation;
        stateChanged();
    }

    public void setFollowUserLocation(boolean followUserLocation) {
        mFollowUserLocation = followUserLocation;
        stateChanged();
    }



    public void setCameraMode(@CameraMode.Mode int cameraMode) {
        mCameraMode = cameraMode;
        stateChanged();

        LocationComponentPlugin locationComponent = LocationComponentUtils.getLocationComponent(mMapView);

        if (mCameraMode == CameraMode.NONE || mCameraMode == CameraMode.TRACKING) {
            locationComponent.removeOnIndicatorBearingChangedListener(mLocationBearingChangedListener);
        } else {
            locationComponent.addOnIndicatorBearingChangedListener(mLocationBearingChangedListener);
        }

        if (mCameraMode == CameraMode.NONE || mCameraMode == CameraMode.NONE_COMPASS || mCameraMode == CameraMode.NONE_GPS) {
            locationComponent.removeOnIndicatorPositionChangedListener(mLocationPositionChangeListener);
        } else {
            locationComponent.addOnIndicatorPositionChangedListener(mLocationPositionChangeListener);
        }
    }

    public void setRenderMode(@RenderMode.Mode int renderMode) {
        mRenderMode = renderMode;
    }
/*
    public void addOnCameraTrackingChangedListener(OnCameraTrackingChangedListener onCameraTrackingChangedListener) {
        // mLocationComponent.addOnCameraTrackingChangedListener(onCameraTrackingChangedListener);
    }*/

    @SuppressLint("MissingPermission")
    private void stateChanged() {
        mLocationComponent.setEnabled((mFollowUserLocation || mShowUserLocation));

        if (mShowingUserLocation != mShowUserLocation) {
            updateShowUserLocation(mShowUserLocation);
        }

        if (mFollowUserLocation) {
            if (!mShowUserLocation) {
               // mLocationComponent.setRenderMode(RenderMode.GPS);
            } else {
                // mLocationComponent.setRenderMode(mRenderMode);
            }
            mLocationComponent.onStart();
        } else {
            // mLocationComponent.setCameraMode(CameraMode.NONE);
        }
        mLocationComponent.setEnabled(mFollowUserLocation || mShowUserLocation);
    }

    public boolean hasLocationComponent() {
        return (mLocationComponent != null);
    }

    public void update(@NonNull Style style) {
        update(mShowUserLocation, style);
    }

    public void update(boolean displayUserLocation, @NonNull Style style) {

        Integer tintColor = mMapView.getSolidColor();

        if (mLocationComponent == null || tintColor != null ) {
            mLocationComponent = LocationComponentUtils.getLocationComponent(mMapView);

            mLocationComponent.setLocationProvider(mLocationManager.getProvider());
            mShowingUserLocation = displayUserLocation;
        }

        updateShowUserLocation(displayUserLocation);
    }

    private void updateShowUserLocation(boolean displayUserLocation) {
        if (mShowingUserLocation != displayUserLocation) {
            applyOptions(displayUserLocation, mLocationComponent);
            mShowingUserLocation = displayUserLocation;
        }
    }

    private void applyOptions(boolean displayUserLocation, LocationComponentPlugin locationComponent) {
        locationComponent.setEnabled(true);
        // Integer tintColor = mMapView.getTintColor();
        if (!displayUserLocation) {
            LocationPuck2D locationPuck = new LocationPuck2D();

            Drawable empty = AppCompatResources.getDrawable(mContext, R.drawable.empty);
            locationPuck.setBearingImage(empty);
            locationPuck.setShadowImage(empty);
            locationPuck.setTopImage(empty);

            locationComponent.setLocationPuck(locationPuck);
        } else /* if (tintColor != null) */ {
            /*
            TypedArray typedArray = mContext.obtainStyledAttributes(
                null, R.styleable.mapbox_MapView, 0,0
            );
            Drawable topImage = typedArray.getDrawable(R.styleable.mapbox_MapView_mapbox_locationComponentLocationPuckLocationPuck2DTopImage);
            */

            LocationPuck2D locationPuck = new LocationPuck2D();

            // ColorFilter filter = new LightingColorFilter(Color.parseColor("#4A90E2"), Color.RED);
            Drawable topImage = AppCompatResources.getDrawable(mContext, R.drawable.mapbox_user_icon);

            /*
            topImage.setColorFilter(filter);

            VectorChildFinder vector = new VectorChildFinder(this, R.drawable.my_vector, imageView);

            VectorDrawableCompat.VFullPath path1 = vector.findPathByName("path1");
            path1.setFillColor(Color.RED);
            */

            locationPuck.setTopImage(topImage);
            Drawable bearingImage = AppCompatResources.getDrawable(mContext, R.drawable.mapbox_user_stroke_icon);
            locationPuck.setBearingImage(bearingImage);
            Drawable shadowImage = AppCompatResources.getDrawable(mContext, R.drawable.mapbox_user_icon_shadow);
            locationPuck.setShadowImage(shadowImage);
            locationComponent.setLocationPuck(locationPuck);
            /*
            locationComponent.setPulsingEnabled(true);
            locationComponent.setPulsingColor(Color.RED);
             */
        }
    }
}
