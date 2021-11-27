package com.mapbox.rctmgl.events;

import android.location.Location;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.events.constants.EventKeys;
import com.mapbox.rctmgl.events.constants.EventTypes;

import java.util.UUID;

public class LocationEvent implements IEvent {
    private UUID uuid;
    private RCTMGLMapView mapView;
    private Location location;

    public LocationEvent(@NonNull Location location, RCTMGLMapView mapView) {
        this.mapView = mapView;
        this.location = location;
        this.uuid = UUID.randomUUID();
    }

    public LocationEvent(Location location) {
        this(location, null);
    }

    @Override
    public int getID() {
        if (mapView != null) {
            return mapView.getId();
        }
        return -1;
    }

    public UUID getUUID() {
        return uuid;
    }

    @Override
    public String getKey() {
        return EventKeys.USER_LOCATION_UPDATE;
    }

    @Override
    public String getType() {
        return EventTypes.USER_LOCATION_UPDATED;
    }

    @Override
    public long getTimestamp() {
        return System.currentTimeMillis();
    }

    @Override
    public boolean equals(IEvent event) {
        LocationEvent other = (LocationEvent) event;
        return getUUID().equals(other.getUUID());
    }

    public boolean equals(LocationEvent event) {
        return uuid.equals(event.getUUID());
    }

    @Override
    public WritableMap getPayload() {
        WritableMap positionProperties = new WritableNativeMap();
        WritableMap coords = new WritableNativeMap();

        coords.putDouble("longitude", location.getLongitude());
        coords.putDouble("latitude", location.getLatitude());
        coords.putDouble("altitude", location.getAltitude());
        coords.putDouble("accuracy", location.getAccuracy());
        // A better solution will be to pull the heading from the compass engine, 
        // unfortunately the api is not publicly available in the mapbox sdk
        coords.putDouble("heading", location.getBearing());
        coords.putDouble("course", location.getBearing());
        coords.putDouble("speed", location.getSpeed());

        positionProperties.putMap("coords", coords);
        positionProperties.putDouble("timestamp", location.getTime());

        return positionProperties;
    }

    @Override
    public WritableMap toJSON() {
        WritableMap map = Arguments.createMap();
        map.putString("type", getType());
        map.putMap("payload", getPayload());
        return map;
    }

    @Override
    public boolean canCoalesce() {
        return true;
    }
}
