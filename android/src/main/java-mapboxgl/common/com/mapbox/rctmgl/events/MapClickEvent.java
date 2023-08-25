package com.mapbox.rctmgl.events;

import android.graphics.PointF;
import androidx.annotation.NonNull;
import android.view.View;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.mapboxsdk.geometry.LatLng;

import com.mapbox.rctmgl.events.constants.EventKeys;
import com.mapbox.rctmgl.events.constants.EventTypes;
import com.mapbox.rctmgl.utils.GeoJSONUtils;

/**
 * Created by nickitaliano on 8/23/17.
 */

public class MapClickEvent extends AbstractEvent {
    private LatLng mTouchedLatLng;
    private PointF mScreenPoint;

    public MapClickEvent(View view, @NonNull LatLng latLng, @NonNull PointF screenPoint) {
        this(view, latLng, screenPoint, EventTypes.MAP_CLICK);
    }

    public MapClickEvent(View view, @NonNull LatLng latLng, @NonNull PointF screenPoint, String eventType) {
        super(view, eventType);
        mTouchedLatLng = latLng;
        mScreenPoint = screenPoint;
    }

    @Override
    public String getKey() {
        String eventType = getType();

        if (eventType.equals(EventTypes.MAP_LONG_CLICK)) {
            return EventKeys.MAP_LONG_CLICK;
        }

        return EventKeys.MAP_CLICK;
    }

    @Override
    public WritableMap getPayload() {
        WritableMap properties = new WritableNativeMap();
        properties.putDouble("screenPointX", mScreenPoint.x);
        properties.putDouble("screenPointY", mScreenPoint.y);
        return GeoJSONUtils.toPointFeature(mTouchedLatLng, properties);
    }
}
