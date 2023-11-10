package com.rnmapbox.rnmbx.events;

import android.view.View;

import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.rnmapbox.rnmbx.events.constants.EventKeys;

public class AndroidCallbackEvent extends AbstractEvent {
    private final WritableMap mPayload;

    public AndroidCallbackEvent(View view, String callbackID, WritableMap payload) {
        super(view, callbackID);
        mPayload = payload;
    }

    @Override
    public String getKey() {
        return EventKeys.MAP_ANDROID_CALLBACK.getValue();
    }

    @Override
    public WritableMap getPayload() {
        return mPayload;
    }

    @Override
    public boolean canCoalesce() {
        // Make sure EventDispatcher never merges EventKeys.MAP_ANDROID_CALLBACK events.
        // These events are couples to unique callbacks references (promises) on the JS side which
        // each expect response with their corresponding callbackID
        return false;
    }
}
