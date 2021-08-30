package com.mapbox.rctmgl.utils;

import com.mapbox.geojson.Point;
import com.mapbox.maps.CoordinateBounds;

public class LatLngBounds {
  LatLng[] toLatLngs() {
    return null;
  }

  double latNorth;
  double lonEast;
  double latSouth;
  double lonWest;

  public CoordinateBounds toBounds() {
    return new CoordinateBounds(
            Point.fromLngLat(lonWest, latSouth),
            Point.fromLngLat(lonEast, latNorth),
            false
    );
  }
}