package com.mapbox.rctmgl.impl;

import android.location.Location;

import com.mapbox.mapboxsdk.location.engine.LocationEngineCallback;
import com.mapbox.mapboxsdk.location.engine.LocationEngineResult;

public class LocationEngineResultImpl {
  LocationEngineResult impl;

  LocationEngineResultImpl(LocationEngineResult impl) {
    this.impl = impl;
  }

  public Location getLastLocation() {
    return impl.getLastLocation();
  }
}