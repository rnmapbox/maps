package com.mapbox.rctmgl.location;

import android.graphics.PointF;
import android.graphics.RectF;
import android.hardware.GeomagneticField;
import android.location.Location;
import android.util.Log;

import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.plugins.locationlayer.TurfTransformation;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.services.api.utils.turf.TurfConstants;
import com.mapbox.services.api.utils.turf.TurfHelpers;
import com.mapbox.services.api.utils.turf.TurfMeasurement;
import com.mapbox.services.commons.geojson.Point;

/**
 * Created by nickitaliano on 12/13/17.
 */

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
