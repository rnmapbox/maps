package com.mapbox.rctmgl.impl;

import com.mapbox.mapboxsdk.location.engine.LocationEngineCallback;
import com.mapbox.mapboxsdk.location.engine.LocationEngineResult;

public abstract class LocationEngineCallbackImpl implements LocationEngineCallback<LocationEngineResult> {
  public void onSuccess(LocationEngineResult result) {
    onSuccess(new LocationEngineResultImpl(result));
  }

  abstract public void onSuccess(LocationEngineResultImpl result);
}