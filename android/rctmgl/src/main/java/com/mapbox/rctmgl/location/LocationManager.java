package com.mapbox.rctmgl.location;

import android.content.Context;
import android.location.Location;
import android.util.Log;

import com.mapbox.android.core.location.LocationEngine;

import com.mapbox.android.core.location.LocationEngineListener;
import com.mapbox.android.core.location.LocationEnginePriority;

import com.mapbox.android.core.location.LocationEngineProvider;
import com.mapbox.android.core.permissions.PermissionsManager;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Created by nickitaliano on 12/12/17.
 */

@SuppressWarnings({"MissingPermission"})
public class LocationManager implements LocationEngineListener {
    public static final String LOG_TAG = LocationManager.class.getSimpleName();

    private LocationEngine locationEngine;
    private Context context;
    private List<OnUserLocationChange> listeners = new ArrayList<>();

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
        LocationEngineProvider locationEngineProvider = new LocationEngineProvider(context.getApplicationContext());
        locationEngine = locationEngineProvider.obtainBestLocationEngineAvailable();
        locationEngine.setPriority(LocationEnginePriority.HIGH_ACCURACY);
        locationEngine.addLocationEngineListener(this);
        locationEngine.setFastestInterval(1000);
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

    public void enable() {
        if (!PermissionsManager.areLocationPermissionsGranted(context)) {
            return;
        }
        locationEngine.activate();
    }

    public void disable() {
        locationEngine.removeLocationUpdates();
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

    public boolean isActive() {
        return locationEngine != null && locationEngine.isConnected();
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
        Log.d(LOG_TAG, "Connected");
        locationEngine.requestLocationUpdates();

        Location lastKnownLocation = getLastKnownLocation();
        if (lastKnownLocation != null) {
            onLocationChanged(lastKnownLocation);
        }
    }

    @Override
    public void onLocationChanged(Location location) {
        Log.d(LOG_TAG, String.format(Locale.ENGLISH, "Tick [%f, %f]", location.getLongitude(), location.getLatitude()));
        Log.d(LOG_TAG, String.format(Locale.ENGLISH, "Listener count %d", listeners.size()));

        for (OnUserLocationChange listener : listeners) {
            listener.onLocationChange(location);
        }
    }
}
