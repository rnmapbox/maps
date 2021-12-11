package com.mapbox.rctmgl.utils;

import com.mapbox.geojson.Point;
import com.mapbox.maps.CoordinateBounds;

public class LatLngBounds {
  public static LatLngBounds from(double bbox, double bbox1, double bbox2, double bbox3) {
    return new LatLngBounds(bbox, bbox1, bbox2, bbox3);
  }

  LatLng getSouthWest() {
    return new LatLng(latSouth, lonWest);
  }

  LatLng getNorthEast() {
    return new LatLng(latNorth, lonEast);
  }

  LatLng[] toLatLngs() {
    return new LatLng[] {getNorthEast(), getSouthWest()};
  }
  
  double latNorth;
  double lonEast;
  double latSouth;
  double lonWest;

  LatLngBounds(double latNorth,double lonEast, double latSouth, double lonWest) {
    this.latNorth = latNorth;
    this.lonEast = lonEast;
    this.latSouth = latSouth;
    this.lonWest = lonWest;
  }

  public CoordinateBounds toBounds() {
    return new CoordinateBounds(
            Point.fromLngLat(lonWest, latSouth),
            Point.fromLngLat(lonEast, latNorth),
            false
    );
  }
}