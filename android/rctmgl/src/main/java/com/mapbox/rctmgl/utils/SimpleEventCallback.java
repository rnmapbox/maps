package com.mapbox.rctmgl.utils;

import com.mapbox.mapboxsdk.maps.MapboxMap;

import com.mapbox.rctmgl.components.AbstractEventEmitter;
import com.mapbox.rctmgl.events.IEvent;

/**
 * Created by nickitaliano on 8/31/17.
 */

public class SimpleEventCallback implements MapboxMap.CancelableCallback {
    private AbstractEventEmitter mEventEmitter;
    private IEvent mEvent;

    public SimpleEventCallback(AbstractEventEmitter eventEmitter, IEvent event) {
        mEventEmitter = eventEmitter;
        mEvent = event;
    }

    @Override
    public void onCancel() {
        mEventEmitter.handleEvent(mEvent);
    }

    @Override
    public void onFinish() {
        mEventEmitter.handleEvent(mEvent);
    }
}
