package com.mapbox.rctmgl.modules;

import android.location.Location;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

/*
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;

import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import com.mapbox.android.core.location.LocationEngineCallback;
import com.mapbox.android.core.location.LocationEngineResult;
import com.mapbox.rctmgl.events.EventEmitter;
import com.mapbox.rctmgl.events.IEvent;
import com.mapbox.rctmgl.events.LocationEvent;
import com.mapbox.rctmgl.location.LocationManager;
*/

@ReactModule(name = RCTMGLLocationModule.REACT_CLASS)
public class RCTMGLLocationModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "RCTMGLLocationModule";
    public static final String LOCATION_UPDATE = "MapboxUserLocationUpdate";

    public RCTMGLLocationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        // locationManager = LocationManager.getInstance(reactContext);
        // reactContext.addLifecycleEventList ener(lifecycleEventListener);
    }


    @ReactMethod
    public void start(float minDisplacement) {
//        startLocationManager();
    }

    @ReactMethod
    public void stop() {
      //stopLocationManager();
  }

    @ReactMethod
    public void pause() {
        //pauseLocationManager();
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }
}