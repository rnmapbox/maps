package com.mapbox.rctmgl.components;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import javax.annotation.Nullable;

public class AbstractEvent extends Event<AbstractEvent> {
    private String mEventName;
    private final boolean mCanCoalesce;
    private WritableMap mEvent;

    public AbstractEvent(int viewId, String eventName, boolean canCoalesce, @Nullable WritableMap event) {
        super(viewId);
        mEventName = eventName;
        mCanCoalesce = canCoalesce;
        mEvent = event;
    }

    @Override
    public String getEventName() {
        return mEventName;
    }

    @Override
    public void dispatch(RCTEventEmitter rctEventEmitter) {
        rctEventEmitter.receiveEvent(getViewTag(), getEventName(), mEvent);
    }

    @Override
    public boolean canCoalesce() {
        return mCanCoalesce;
    }
}