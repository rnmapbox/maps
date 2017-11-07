package com.mapbox.rctmgl.events;

import com.facebook.react.bridge.WritableMap;

/**
 * Created by nickitaliano on 8/23/17.
 */

public interface IEvent {
    int getID();
    String getKey();
    String getType();
    long getTimestamp();
    boolean equals(IEvent event);
    WritableMap getPayload();
    WritableMap toJSON();
}
