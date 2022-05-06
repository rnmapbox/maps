package com.mapbox.rctmgl.impl;

import com.mapbox.android.core.location.LocationEngineCallback;
import com.mapbox.android.core.location.LocationEngineResult;

public abstract class LocationEngineCallbackImpl implements LocationEngineCallback<LocationEngineResult> {
  public void onSuccess(LocationEngineResult result) {
    onSuccess(new LocationEngineResultImpl(result));
  }

  abstract public void onSuccess(LocationEngineResultImpl result);
}