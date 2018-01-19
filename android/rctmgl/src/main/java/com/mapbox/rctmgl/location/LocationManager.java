package com.mapbox.rctmgl.location;

import android.content.Context;
import android.location.Location;
import android.util.Log;

import com.mapbox.mapboxsdk.Mapbox;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.plugins.locationlayer.CompassListener;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.services.android.location.MockLocationEngine;
import com.mapbox.services.android.telemetry.location.GoogleLocationEngine;
import com.mapbox.services.android.telemetry.location.LocationEngine;
import com.mapbox.services.android.telemetry.location.LocationEngineListener;
import com.mapbox.services.android.telemetry.location.LocationEnginePriority;
import com.mapbox.services.android.telemetry.location.LostLocationEngine;
import com.mapbox.services.android.telemetry.permissions.PermissionsManager;
import com.mapbox.services.api.directions.v5.DirectionsCriteria;
import com.mapbox.services.api.directions.v5.MapboxDirections;
import com.mapbox.services.api.directions.v5.models.DirectionsResponse;
import com.mapbox.services.api.directions.v5.models.DirectionsRoute;
import com.mapbox.services.commons.models.Position;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * Created by nickitaliano on 12/12/17.
 */

@SuppressWarnings({"MissingPermission"})
public class LocationManager implements LocationEngineListener {
    // TODO: Add JS API to allow easier UI testing
    private static final boolean MOCK_LOCATION = false;
    private static final double[] originCoord = new double[]{ -74.135319, 40.795952 };
    private static final double[] destCoord = new double[]{ -74.134510, 40.787626 };

    private LocationEngine locationEngine;
    private OnUserLocationChange userLocationListener;
    private Context context;

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
            if (MOCK_LOCATION) {
                Position origin = Position.fromCoordinates(originCoord);
                Position dest = Position.fromCoordinates(destCoord);

                List<Position> positionList = new ArrayList<>();
                positionList.add(origin);
                positionList.add(dest);

                MapboxDirections client = new MapboxDirections.Builder<>()
                        .setAccessToken(Mapbox.getAccessToken())
                        .setProfile(DirectionsCriteria.PROFILE_DRIVING)
                        .setSteps(true)
                        .setCoordinates(positionList)
                        .build();

                final LocationManager self = this;
                client.enqueueCall(new Callback<DirectionsResponse>() {
                    @Override
                    public void onResponse(Call<DirectionsResponse> call, Response<DirectionsResponse> response) {
                        DirectionsRoute route = response.body().getRoutes().get(0);

                        MockLocationEngine mockLocationEngine = new MockLocationEngine();
                        mockLocationEngine.setRoute(route);

                        locationEngine = mockLocationEngine;
                        locationEngine.setPriority(LocationEnginePriority.HIGH_ACCURACY);
                        locationEngine.addLocationEngineListener(self);
                        locationEngine.setFastestInterval(1000);
                        locationEngine.activate();
                    }

                    @Override
                    public void onFailure(Call<DirectionsResponse> call, Throwable t) {

                    }
                });
            } else {
                locationEngine = LostLocationEngine.getLocationEngine(context);
                locationEngine.setPriority(LocationEnginePriority.HIGH_ACCURACY);
                locationEngine.addLocationEngineListener(this);
                locationEngine.setFastestInterval(1000);
                locationEngine.activate();
            }
        } else {
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
