package com.mapbox.rctmgl.components;

import android.app.Application;
import android.view.ViewGroup;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.CatalystInstance;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

import com.mapbox.rctmgl.events.IEvent;

/**
 * Created by nickitaliano on 8/23/17.
 */

abstract public class AbstractEventEmitter<T extends ViewGroup> extends ViewGroupManager<T> {
    private static final double BRIDGE_TIMEOUT_MS = 10;
    private Map<String, Long> mRateLimitedEvents;
    private ReactApplicationContext mRCTAppContext;

    public AbstractEventEmitter(ReactApplicationContext reactApplicationContext) {
        mRCTAppContext = reactApplicationContext;
        mRateLimitedEvents = new HashMap<>();
    }

    public void handleEvent(IEvent event) {
        String eventCacheKey = getEventCacheKey(event);

        // fail safe to protect bridge from being spammed
        if (shouldDropEvent(eventCacheKey, event)) {
            return;
        }

        mRateLimitedEvents.put(eventCacheKey, System.currentTimeMillis());
        getEventEmitter().receiveEvent(event.getID(), event.getKey(), event.toJSON());
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        Map<String, String> events = customEvents();
        Map<String, Object> exportedEvents = new HashMap<>();

        for (Map.Entry<String, String> event : events.entrySet()) {
            exportedEvents.put(event.getKey(), MapBuilder.of("registrationName", event.getValue()));
        }

        return exportedEvents;
    }

    public abstract Map<String, String> customEvents();

    /**
     * React Native constructs the mRCTAppContext when the {@link ReactInstanceManager} starts up and creates the
     * {@link NativeModule}s and {@link ViewManager}s. This happens on app fresh boot, but also anytime the JS VM 'restarts'.
     * There are a few different cases when this instance manager will recreate the ReactContext...
     *
     * 1.) When a developer is on a debug build and 'reloads' the javascript.
     * 2.) If using Codepush, it 'reloads' the react engine, which essentially does the same things as step 1.
     *
     * If RN ever reloads, It will reconstruct all of the CoreModules here {CoreModulesPackage#getNativeModules(ReactApplicationContext)}
     * which reconstructs the all of the RN package's {{@link NativeModule}}s. It also should be in charge of recreating the
     * View Managers... However, A recent change to React Native introduced a big bug with how these ViewManagers are recreated.
     *
     * If you look at this method, {@link ReactInstanceManager#getOrCreateViewManagers(ReactApplicationContext)}
     * You will see that it will simply reuse the existing ViewManagers
     * EVEN THOUGH THEY CONTAIN THE OLD ReactContexts !!!
     *
     * This was introduced with this commit.
     * https://github.com/facebook/react-native/commit/4371d1e1d0318c3aa03738583a24b833f0a33ba1
     *
     * This means that the new View's that are constructed with this old react context contains a stale {@link CatalystInstance}.
     *
     * This class is a perfect example. In the case when RN was reloaded, it tries to get the RCTEventEmitter instance from an
     * old {@link ReactContext}. This means that all events delegated to that emitter are posting to a dead thread! (you can
     * check the logcat output you will see warnings from ReactNative that the events are posted on a dead thread)
     *
     * This code below is a simple band aid, assuming that your {@link Application} instance is a {@link ReactApplication}
     *
     * A better solution would be to decouple the event emitter from the ViewManagers. An even better solution, would be to fix
     * this in React Native itself. When recreating the ReactContext, and it already has view managers, tell them to use the new
     * ReactContext, instead of skipping over them entirely.
     *
     *
     * @return the most recent {@link RCTEventEmitter} instance
     */
    private RCTEventEmitter getEventEmitter() {
        return ((ReactApplication) mRCTAppContext.getApplicationContext()).getReactNativeHost().getReactInstanceManager()
            .getCurrentReactContext().getJSModule(RCTEventEmitter.class);
    }

    private boolean shouldDropEvent(String cacheKey, IEvent event) {
        Long lastEventTimestamp = mRateLimitedEvents.get(cacheKey);
        return lastEventTimestamp != null && (event.getTimestamp() - lastEventTimestamp) <= BRIDGE_TIMEOUT_MS;
    }

    private String getEventCacheKey(IEvent event) {
        return String.format("%s-%s", event.getKey(), event.getType());
    }
}
