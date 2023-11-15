package com.rnmapbox.rnmbx.events;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

public class OfflineEvent extends AbstractEvent {
    private String mEventKey;
    private WritableMap mPayload;

    public OfflineEvent(String eventKey, String eventType, WritableMap payload) {
        super(eventType);
        mEventKey = eventKey;
        mPayload = payload;
    }

    @Override
    public String getKey() {
        return mEventKey;
    }

    @Override
    public WritableMap getPayload() {
        return mPayload;
    }
}
