package com.mapbox.rctmgl.location;

import android.location.Location;

import com.mapbox.rctmgl.utils.LatLng;

public class UserLocation {
    private Location currentLocation;
    private Location previousLocation;

    private int userTrackingMode = UserTrackingMode.NONE;

    public UserLocation() {
        this(null);
    }

    public UserLocation(Location currentLocation) {
        this.currentLocation = currentLocation;
    }

    public Location getCurrentLocation() {
        return currentLocation;
    }

    public double getBearing() {
        if (currentLocation == null) {
            return 0.0;
        }
        return currentLocation.getBearing();
    }

    public LatLng getCoordinate() {
        if (currentLocation == null) {
            return null;
        }

        return new LatLng(currentLocation.getLatitude(), currentLocation.getLongitude());
    }

    public void setCurrentLocation(Location currentLocation) {
        this.previousLocation = this.currentLocation;
        this.currentLocation = currentLocation;
    }

    public void setTrackingMode(int userTrackingMode) {
        this.userTrackingMode = userTrackingMode;
    }

    public int getTrackingMode() {
        return userTrackingMode;
    }

    public float getDistance(Location location) {
        if (currentLocation == null) {
            return 0.0f;
        }
        return currentLocation.distanceTo(location);
    }
}
