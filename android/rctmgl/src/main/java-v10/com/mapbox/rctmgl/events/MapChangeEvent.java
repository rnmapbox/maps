package com.mapbox.rctmgl.events;

import android.view.View;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import com.mapbox.rctmgl.events.constants.EventKeys;

public class MapChangeEvent extends AbstractEvent {
    private WritableMap mPayload;

    public MapChangeEvent(View view, String eventType) {
        this(view, eventType, Arguments.createMap());
    }

    public MapChangeEvent(View view, String eventType, WritableMap payload) {
        super(view, eventType);
        mPayload = payload;
    }

    @Override
    public String getKey() {
        return EventKeys.MAP_ONCHANGE;
    }

    @Override
    public WritableMap getPayload() {
        // FMTODO
        WritableMap payloadClone = Arguments.createMap();
        payloadClone.merge(mPayload);
        return payloadClone;
    }

    @Override
    public boolean canCoalesce() {
        // Make sure EventDispatcher never merges EventKeys.MAP_ONCHANGE events.
        // This event name is used to emit events with different
        // com.mapbox.rctmgl.events.constants.EventTypes which are dispatched separately on
        // the JS side
        return false;
    }
}
