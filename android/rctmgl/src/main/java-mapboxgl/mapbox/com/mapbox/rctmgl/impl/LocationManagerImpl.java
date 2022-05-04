package com.mapbox.rctmgl.impl;

import android.content.Context;

import android.os.Looper;

import com.mapbox.android.core.location.LocationEngine;
import com.mapbox.android.core.location.LocationEngineCallback;
import com.mapbox.android.core.location.LocationEngineProvider;
import com.mapbox.android.core.location.LocationEngineRequest;
import com.mapbox.android.core.location.LocationEngineResult;
import com.mapbox.android.core.permissions.PermissionsManager;

public class LocationManagerImpl {
  LocationEngine locationEngine;
  LocationEngineRequest locationEngineRequest;

  LocationManagerImpl(LocationEngine locationEngine, LocationEngineRequest locationEngineRequest) {
    this.locationEngine = locationEngine;
    this.locationEngineRequest = locationEngineRequest;
  }

  public static LocationManagerImpl buildEngineRequest(Context context, long default_interval, long fastest_interval, float minDisplacement) {
    return new LocationManagerImpl(
      LocationEngineProvider.getBestLocationEngine(context),
      new LocationEngineRequest.Builder(default_interval)
                .setFastestInterval(fastest_interval)
                .setPriority(LocationEngineRequest.PRIORITY_HIGH_ACCURACY)
                .setDisplacement(minDisplacement)
                .build()
    );
  }

  public void removeExistingListeners(LocationEngineCallbackImpl callback) {
    locationEngine.removeLocationUpdates(callback);
  }

  public void addNewListeners(LocationEngineCallbackImpl callback) {
    locationEngine.requestLocationUpdates(
            locationEngineRequest,
            callback,
            Looper.getMainLooper()
    );
  }

  public void dispose(LocationEngineCallbackImpl callback) {
    if (locationEngine == null) {
      return;
    }
    locationEngine.removeLocationUpdates(callback);
  }

  public boolean isActive() {
    return (locationEngine != null);
  }

  public void getLastLocation(LocationEngineCallbackImpl callback) {
    locationEngine.getLastLocation(callback); 
  }

  public LocationEngine getEngine() {
    return locationEngine;
  }
}
