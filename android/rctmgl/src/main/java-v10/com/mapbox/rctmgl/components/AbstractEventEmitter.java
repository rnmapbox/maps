package com.mapbox.rctmgl.components;

import android.view.ViewGroup;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.mapbox.rctmgl.events.IEvent;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;
import javax.annotation.Nonnull;

/**
 * Created by nickitaliano on 8/23/17.
 */

abstract public class AbstractEventEmitter<T extends ViewGroup> extends ViewGroupManager<T> {
    private static final double BRIDGE_TIMEOUT_MS = 10;
    private Map<String, Long> mRateLimitedEvents;
    private EventDispatcher mEventDispatcher;
    private ReactApplicationContext mRCTAppContext;

    public AbstractEventEmitter(ReactApplicationContext reactApplicationContext) {
        mRateLimitedEvents = new HashMap<>();
        mRCTAppContext = reactApplicationContext;
    }

    public void handleEvent(IEvent event) {
        String eventCacheKey = getEventCacheKey(event);

        // fail safe to protect bridge from being spammed
        if (shouldDropEvent(eventCacheKey, event)) {
            return;
        }

        mRateLimitedEvents.put(eventCacheKey, System.currentTimeMillis());
//        mEventDispatcher.dispatchEvent(new AbstractEvent(event.getID(), event.getKey(), event.canCoalesce(), event.toJSON()));
    }

    @Override
    protected void addEventEmitters(ThemedReactContext context, @Nonnull T view) {
        mEventDispatcher = context.getNativeModule(UIManagerModule.class).getEventDispatcher();
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        Map<String, String> events = customEvents();

        if (events == null) {
            return null;
        }

        Map<String, Object> exportedEvents = new HashMap<>();

        for (Map.Entry<String, String> event : events.entrySet()) {
            exportedEvents.put(event.getKey(), MapBuilder.of("registrationName", event.getValue()));
        }

        return exportedEvents;
    }

    @Nullable
    public abstract Map<String, String> customEvents();

    private boolean shouldDropEvent(String cacheKey, IEvent event) {
        Long lastEventTimestamp = mRateLimitedEvents.get(cacheKey);
        return lastEventTimestamp != null && (event.getTimestamp() - lastEventTimestamp) <= BRIDGE_TIMEOUT_MS;
    }

    private String getEventCacheKey(IEvent event) {
        return String.format("%s-%s", event.getKey(), event.getType());
    }
}
