package com.mapbox.rctmgl.events;

import android.view.View;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

/**
 * Created by nickitaliano on 8/27/17.
 */

abstract public class AbstractEvent implements IEvent {
    private int mTagID;
    private String mEventType;
    private long mTimestamp;

    public AbstractEvent(String eventType) {
        this(null, eventType);
    }

    public AbstractEvent(View view, String eventType) {
        mEventType = eventType;

        if (view != null) {
            mTagID = view.getId();
        }

        mTimestamp = System.currentTimeMillis();
    }

    public int getID() {
        return mTagID;
    }

    public String getType() {
        return mEventType;
    }

    public boolean equals(IEvent event) {
        return getKey().equals(event.getKey()) && mEventType.equals(event.getType());
    }

    public WritableMap getPayload() {
        return Arguments.createMap();
    }

    public long getTimestamp() {
        return mTimestamp;
    }

    public WritableMap toJSON() {
        WritableMap map = Arguments.createMap();
        map.putString("type", getType());

        WritableMap payloadClone = Arguments.createMap();
        payloadClone.merge(getPayload());
        map.putMap("payload", payloadClone);
        return map;
    }

    @Override
    public boolean canCoalesce() {
        // default behavior of com.facebook.react.uimanager.events.Event
        return true;
    }
}
