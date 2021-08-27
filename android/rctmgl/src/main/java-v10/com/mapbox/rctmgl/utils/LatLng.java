package com.mapbox.rctmgl.utils;


import com.mapbox.geojson.Point;

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