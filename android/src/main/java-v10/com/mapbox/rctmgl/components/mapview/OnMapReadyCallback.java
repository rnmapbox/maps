package com.mapbox.rctmgl.components.mapview;

import androidx.annotation.NonNull;

import com.mapbox.maps.MapboxMap;

public interface OnMapReadyCallback {
  public void onMapReady(@NonNull MapboxMap mapboxMap);
}
