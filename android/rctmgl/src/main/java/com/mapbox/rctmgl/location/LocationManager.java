package com.mapbox.rctmgl.location;

import android.content.Context;
import android.location.Location;

import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.plugins.locationlayer.CompassListener;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.services.android.telemetry.location.GoogleLocationEngine;
import com.mapbox.services.android.telemetry.location.LocationEngine;
import com.mapbox.services.android.telemetry.location.LocationEngineListener;
import com.mapbox.services.android.telemetry.location.LocationEnginePriority;
import com.mapbox.services.android.telemetry.location.LostLocationEngine;
import com.mapbox.services.android.telemetry.permissions.PermissionsManager;

/**
 * Created by nickitaliano on 12/12/17.
 */

@SuppressWarnings({"MissingPermission"})
public class LocationManager implements LocationEngineListener, CompassListener {
    private LocationEngine locationEngine;

    private float previousUserHeading = 0.0f;
    private OnUserLocationChange userLocationListener;

    private Context context;

    @Override
    public void onCompassChanged(float userHeading) {
        Location location = getLastKnownLocation();

        if (location == null || previousUserHeading == userHeading) {
            return;
        }

        previousUserHeading = userHeading;
        location.setBearing(userHeading);
        onLocationChanged(location);
    }

    @Override
    public void onCompassAccuracyChange(int compassStatus) {
        Location location = getLastKnownLocation();

        if (location == null) {
            return;
        }

        location.setAccuracy(compassStatus);
        onLocationChanged(location);
    }

    public interface OnUserLocationChange {
        void onLocationChange(Location location);
    }

    public LocationManager(Context context) {
        this.context = context;
    }

    public void enable() {
        if (!PermissionsManager.areLocationPermissionsGranted(context)) {
            return;
        }

        if (locationEngine == null) {
            locationEngine = new LostLocationEngine(context);
            locationEngine.setPriority(LocationEnginePriority.HIGH_ACCURACY);
            locationEngine.addLocationEngineListener(this);
            locationEngine.setFastestInterval(1000);
            locationEngine.activate();
        }
    }

    public void disable() {
        if (locationEngine == null) {
            return;
        }
        locationEngine.deactivate();
    }

    public void dispose() {
        if (locationEngine == null) {
            return;
        }
        disable();
        locationEngine.removeLocationUpdates();
        locationEngine.removeLocationEngineListener(this);
    }

    public void setOnLocationChangeListener(OnUserLocationChange listener) {
        this.userLocationListener = listener;
    }

    public boolean isActive() {
        if (locationEngine == null) {
            return false;
        }
        return locationEngine.isConnected();
    }

    public Location getLastKnownLocation() {
        if (locationEngine == null) {
            return null;
        }
        return locationEngine.getLastLocation();
    }

    public LocationEngine getEngine() {
        return locationEngine;
    }

    @Override
    public void onConnected() {
        locationEngine.requestLocationUpdates();

        Location lastKnownLocation = getLastKnownLocation();
        if (lastKnownLocation != null) {
            onLocationChanged(lastKnownLocation);
        }
    }

    @Override
    public void onLocationChanged(Location location) {
        if (this.userLocationListener != null) {
            this.userLocationListener.onLocationChange(location);
        }
    }
}
