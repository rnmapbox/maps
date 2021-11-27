package com.mapbox.rctmgl.location;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

import com.mapbox.android.core.location.LocationEngine;
import com.mapbox.android.core.location.LocationEngineCallback;

import com.mapbox.android.core.location.LocationEngineProvider;
import com.mapbox.android.core.location.LocationEngineRequest;
import com.mapbox.android.core.location.LocationEngineResult;
import com.mapbox.android.core.permissions.PermissionsManager;
import com.mapbox.geojson.Point;
import com.mapbox.maps.plugin.locationcomponent.LocationConsumer;
import com.mapbox.maps.plugin.locationcomponent.LocationProvider;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.function.Consumer;


class LocationProviderForEngine implements LocationProvider, LocationEngineCallback<LocationEngineResult> {
    LocationEngine mEngine;
    ArrayList<LocationConsumer> mConsumers = new ArrayList<>();

    LocationProviderForEngine(LocationEngine engine) {
        mEngine = engine;
    }

    void beforeAddingFirstConsumer() {

    }

    void afterRemovedLastConsumer() {
    }

    @SuppressLint("MissingPermission")
    @Override
    public void registerLocationConsumer(@NonNull LocationConsumer locationConsumer) {
        if (mConsumers.isEmpty()) {
            beforeAddingFirstConsumer();
        }
        mConsumers.add(locationConsumer);
        mEngine.getLastLocation(this);
    }

    @Override
    public void unRegisterLocationConsumer(@NonNull LocationConsumer locationConsumer) {
        mConsumers.remove(locationConsumer);
        if (mConsumers.isEmpty()) {
            afterRemovedLastConsumer();
        }
    }

    public void notifyLocationUpdates(Location location) {
        for (LocationConsumer consumer: mConsumers) {
            Point points[] = new Point[] { Point.fromLngLat(location.getLongitude(),location.getLatitude()) };
            consumer.onLocationUpdated(points, null);
            double bearings[] = new double[] { location.getBearing() };
            consumer.onBearingUpdated(bearings, null);
        }
    }

    // * LocationEngineCallback

    @Override
    public void onSuccess(LocationEngineResult locationEngineResult) {
        Location location = locationEngineResult.getLastLocation();
        if (location != null) {
            notifyLocationUpdates(location);
        }
    }

    @Override
    public void onFailure(@NonNull Exception e) {

    }
}

@SuppressWarnings({"MissingPermission"})
public class LocationManager implements LocationEngineCallback<LocationEngineResult> {
    static final long DEFAULT_FASTEST_INTERVAL_MILLIS = 1000;
    static final long DEFAULT_INTERVAL_MILLIS = 1000;

    public static final String LOG_TAG = "LocationManager";

    private LocationEngine locationEngine;
    private Context context;
    private List<OnUserLocationChange> listeners = new ArrayList<>();

    private float mMinDisplacement = 0;
    private boolean isActive = false;
    private Location lastLocation = null;

    private LocationEngineRequest locationEngineRequest = null;

    private LocationProviderForEngine locationProvider = null;

    private static WeakReference<LocationManager> INSTANCE = null;

    public static LocationManager getInstance(Context context) {
        if (INSTANCE == null) {
            INSTANCE = new WeakReference<>(new LocationManager(context));
        }
        return INSTANCE.get();
    }

    public LocationProvider getProvider() {
        if (locationProvider == null) {
            locationProvider = new LocationProviderForEngine(locationEngine);
        }
        return locationProvider;
    }

    public interface OnUserLocationChange {
        void onLocationChange(Location location);
    }

    private LocationManager(Context context) {
        this.context = context;
        this.buildEngineRequest();

    }
    private void buildEngineRequest() {
        locationEngine = LocationEngineProvider.getBestLocationEngine(this.context.getApplicationContext());
        locationEngineRequest = new LocationEngineRequest.Builder(DEFAULT_INTERVAL_MILLIS)
                .setFastestInterval(DEFAULT_FASTEST_INTERVAL_MILLIS)
                .setPriority(LocationEngineRequest.PRIORITY_HIGH_ACCURACY)
                .setDisplacement(mMinDisplacement)
                .build();
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
        if (!PermissionsManager.areLocationPermissionsGranted(context)) {
            return;
        }

        // remove existing listeners
        locationEngine.removeLocationUpdates(this);

        // refresh location engine request with new values
        this.buildEngineRequest();

        // add new listeners
        locationEngine.requestLocationUpdates(
                locationEngineRequest,
                this,
                Looper.getMainLooper()
        );
        isActive = true;
    }

    public void disable() {
        locationEngine.removeLocationUpdates(this);
        isActive = false;
    }

    public void dispose() {
        if (locationEngine == null) {
            return;
        }
        disable();
        locationEngine.removeLocationUpdates(this);
    }

    public boolean isActive() {
        return locationEngine != null && this.isActive;
    }

    public Location getLastKnownLocation() {
        if (locationEngine == null) {
            return null;
        }
        return lastLocation;
    }


    public void getLastKnownLocation(LocationEngineCallback<LocationEngineResult> callback) {
        if (locationEngine == null) {
            callback.onFailure(new Exception("LocationEngine not initialized"));
        }

        try {
            locationEngine.getLastLocation(callback);
        }
        catch(Exception exception) {
            Log.w(LOG_TAG, exception);
            callback.onFailure(exception);
        }
    }

    public LocationEngine getEngine() {
        return locationEngine;
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
    public void onSuccess(LocationEngineResult result) {
        onLocationChanged(result.getLastLocation());
        if (locationProvider != null) {
            locationProvider.onSuccess(result);
        }
    }
}
