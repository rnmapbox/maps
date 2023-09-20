package com.rnmapbox.rnmbx.utils;


import com.mapbox.geojson.Point;

import java.util.ArrayList;
import java.util.List;

public class LatLng {
  double latitude;
  double longitude;

  public LatLng(double latitude, double longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  public LatLng(Point point) {
    this.latitude = point.latitude();
    this.longitude = point.longitude();
  }

  public Point getPoint() {
    return Point.fromLngLat(this.longitude, this.latitude);
  }

  public List<Double> getArray() {
    ArrayList<Double> ret = new ArrayList<>();
    ret.add(this.longitude);
    ret.add(this.latitude);
    return ret;
  }

  public double getLongitude() {
    return longitude;
  }

  public double getLatitude() {
    return latitude;
  }

  double latitude() {
    return latitude;
  }

  double longitude() {
    return longitude;
  }

  
}