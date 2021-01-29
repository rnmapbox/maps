package com.mapbox.rctmgl.events;

import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import com.facebook.react.uimanager.events.RCTEventEmitter;


public class EventEmitter {
    public static final String LOG_TAG = "EventEmitter";


    private static ReactContext getCurrentReactContext(ReactApplicationContext reactApplicationContext) {
        if (reactApplicationContext.getApplicationContext() instanceof ReactApplication) {
            ReactApplication reactApplication = ((ReactApplication) reactApplicationContext
                    .getApplicationContext());

            return reactApplication
                    .getReactNativeHost()
                    .getReactInstanceManager()
                    .getCurrentReactContext();
        } else {
            Log.d(LOG_TAG, "getApplicationContext() application doesn't implement ReactApplication");
            return reactApplicationContext;
        }
    }


    public static RCTNativeAppEventEmitter getModuleEmitter(ReactApplicationContext reactApplicationContext) {
        RCTNativeAppEventEmitter emitter = null;

        try {
            emitter = getCurrentReactContext(reactApplicationContext)
                    .getJSModule(RCTNativeAppEventEmitter.class);
        } catch (NullPointerException e) {
            Log.d(LOG_TAG, e.getLocalizedMessage());
        }

        return emitter;
    }
}
