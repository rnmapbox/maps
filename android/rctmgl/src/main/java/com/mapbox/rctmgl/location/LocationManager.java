package com.mapbox.rctmgl.location;

import android.content.Context;
import android.location.Location;
import android.os.Looper;
import android.util.Log;

import com.mapbox.rctmgl.impl.LocationManagerImpl;
import com.mapbox.rctmgl.impl.LocationEngineCallbackImpl;
import com.mapbox.rctmgl.impl.LocationEngineResultImpl;
import com.mapbox.rctmgl.impl.PermissionsManagerImpl;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Created by nickitaliano on 12/12/17.
 */

@SuppressWarnings({"MissingPermission"})
public class LocationManager extends LocationEngineCallbackImpl {
    static final long DEFAULT_FASTEST_INTERVAL_MILLIS = 1000;
    static final long DEFAULT_INTERVAL_MILLIS = 1000;

    public static final String LOG_TAG = "LocationManager";

    LocationManagerImpl locationManagerImpl;
    private Context context;
    private List<OnUserLocationChange> listeners = new ArrayList<>();

    private float mMinDisplacement = 0;
    private boolean isActive = false;
    private Location lastLocation = null;


    private static WeakReference<LocationManager> INSTANCE = null;

    public static LocationManager getInstance(Context context) {
        if (INSTANCE == null) {
            INSTANCE = new WeakReference<>(new LocationManager(context));
        }
        return INSTANCE.get();
    }

    public interface OnUserLocationChange {
        void onLocationChange(Location location);
    }

    private LocationManager(Context context) {
        this.context = context;
        this.buildEngineRequest();

    }
    private void buildEngineRequest() {
        locationManagerImpl = LocationManagerImpl.buildEngineRequest(this.context.getApplicationContext(), DEFAULT_INTERVAL_MILLIS, DEFAULT_FASTEST_INTERVAL_MILLIS, mMinDisplacement);
    }

    public void addLocationListener(OnUserLocationChange listener) {
        if (!listeners.contains(listener)) {
            listeners.add(listener);
        }
    }

    public void removeLocationListener(OnUserLocationChange listener) {
        if (listeners.contains(listener)) {
            listeners.remove(listener);
        }
    }
    public void setMinDisplacement(float minDisplacement) {
        mMinDisplacement = minDisplacement;
    }
    public void enable() {
        if (!PermissionsManagerImpl.areLocationPermissionsGranted(context)) {
            return;
        }

        // remove existing listeners
        locationManagerImpl.removeExistingListeners(this);

        // refresh location engine request with new values
        this.buildEngineRequest();

        // add new listeners
        locationManagerImpl.addNewListeners(this);
        isActive = true;
    }


    public void disable() {
        locationManagerImpl.removeExistingListeners(this);
        isActive = false;
    }

    public void dispose() {
        locationManagerImpl.dispose(this);
        isActive = false;
    }

    public boolean isActive() {
        return locationManagerImpl.isActive() && this.isActive;
    }

    public Location getLastKnownLocation() {
        if (! locationManagerImpl.isActive()) {
            return null;
        }
        return lastLocation;
    }


    public void getLastKnownLocation(LocationEngineCallbackImpl callback) {
        if (! locationManagerImpl.isActive()) {
            callback.onFailure(new Exception("LocationEngine not initialized"));
        }

        try {
            locationManagerImpl.getLastLocation(callback);
        }
        catch(Exception exception) {
            Log.w(LOG_TAG, exception);
            callback.onFailure(exception);
        }
    }

    public LocationManagerImpl getEngine() {
        return locationManagerImpl;
    }

    public void onLocationChanged(Location location) {
        lastLocation = location;
        for (OnUserLocationChange listener : listeners) {
            listener.onLocationChange(location);
        }
    }

    @Override
    public void onFailure(Exception exception) {
        // FMTODO handle this.
    }

    @Override
    public void onSuccess(LocationEngineResultImpl result) {
        onLocationChanged(result.getLastLocation());
    }
}
