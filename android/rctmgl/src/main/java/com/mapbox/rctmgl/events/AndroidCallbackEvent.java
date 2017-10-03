package com.mapbox.rctmgl.events;

import android.view.View;

import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.mapbox.rctmgl.events.constants.EventKeys;

/**
 * Created by nickitaliano on 10/3/17.
 */

public class AndroidCallbackEvent extends AbstractEvent {
    private String mKey;
    private WritableMap mPayload;

    public AndroidCallbackEvent(View view, String callbackID, String key) {
        super(view, callbackID);
        mKey = key;
    }

    public void setPayload(WritableMap payload) {
        mPayload = payload;
    }

    @Override
    public String getKey() {
        return mKey;
    }

    @Override
    public WritableMap getPayload() {
        return mPayload;
    }
}
