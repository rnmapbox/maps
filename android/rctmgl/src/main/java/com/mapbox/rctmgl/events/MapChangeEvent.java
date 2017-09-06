package com.mapbox.rctmgl.events;

import android.view.View;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import com.mapbox.rctmgl.events.constants.EventKeys;

/**
 * Created by nickitaliano on 8/27/17.
 */

public class MapChangeEvent extends AbstractEvent {
    private WritableMap mPayload;

    public MapChangeEvent(View view, String eventType) {
        this(view, Arguments.createMap(), eventType);
    }

    public MapChangeEvent(View view, WritableMap payload, String eventType) {
        super(view, eventType);
        mPayload = payload;
    }

    @Override
    public String getKey() {
       return EventKeys.MAP_ONCHANGE;
    }

    @Override
    public WritableMap getPayload() {
        return mPayload;
    }
}
