package com.mapbox.rctmgl.events;

import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import com.facebook.react.uimanager.events.RCTEventEmitter;

public class EventEmitter {
    public static final String LOG_TAG = EventEmitter.class.getSimpleName();

    public static RCTNativeAppEventEmitter getModuleEmitter(ReactApplicationContext reactApplicationContext) {
        ReactApplication reactApplication = ((ReactApplication) reactApplicationContext
                .getApplicationContext());

        RCTNativeAppEventEmitter emitter = null;

        try {
            emitter = reactApplication
                    .getReactNativeHost()
                    .getReactInstanceManager()
                    .getCurrentReactContext()
                    .getJSModule(RCTNativeAppEventEmitter.class);
        } catch (NullPointerException e) {
            Log.d(LOG_TAG, e.getLocalizedMessage());
        }

        return emitter;
    }

    public static RCTEventEmitter getViewEmitter(ReactApplicationContext reactApplicationContext) {
        ReactApplication reactApplication = ((ReactApplication) reactApplicationContext
                .getApplicationContext());

        RCTEventEmitter emitter = null;

        try {
            emitter = reactApplication
                    .getReactNativeHost()
                    .getReactInstanceManager()
                    .getCurrentReactContext()
                    .getJSModule(RCTEventEmitter.class);
        } catch (NullPointerException e) {
            Log.d(LOG_TAG, e.getLocalizedMessage());
        }

        return emitter;
    }
}
