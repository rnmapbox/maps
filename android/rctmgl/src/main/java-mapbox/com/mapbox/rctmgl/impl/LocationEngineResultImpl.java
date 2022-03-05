package com.mapbox.rctmgl.impl;

import android.location.Location;

import com.mapbox.android.core.location.LocationEngineCallback;
import com.mapbox.android.core.location.LocationEngineResult;

public class LocationEngineResultImpl {
  LocationEngineResult impl;

  LocationEngineResultImpl(LocationEngineResult impl) {
    this.impl = impl;
  }

  public Location getLastLocation() {
    return impl.getLastLocation();
  }
}