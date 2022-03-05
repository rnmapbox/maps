package com.mapbox.rctmgl.impl;

import android.location.Location;

//#if USE_MAPLIBRE
import com.mapbox.mapboxsdk.location.engine.LocationEngineCallback;
import com.mapbox.mapboxsdk.location.engine.LocationEngineResult;
//#else
///import com.mapbox.android.core.location.LocationEngineCallback;
///import com.mapbox.android.core.location.LocationEngineResult;
//#endif

public class LocationEngineResultImpl {
  LocationEngineResult impl;

  LocationEngineResultImpl(LocationEngineResult impl) {
    this.impl = impl;
  }

  public Location getLastLocation() {
    return impl.getLastLocation();
  }
}