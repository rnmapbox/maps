package com.rnmapbox.rnmbx.components.mapview;

import androidx.annotation.NonNull;

import com.mapbox.maps.MapboxMap;

public interface OnMapReadyCallback {
  public void onMapReady(@NonNull MapboxMap mapboxMap);
}
