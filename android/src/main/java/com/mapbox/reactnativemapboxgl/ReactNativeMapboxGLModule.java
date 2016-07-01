
package com.mapbox.reactnativemapboxgl;

import android.content.Context;
import android.support.annotation.UiThread;
import android.util.Log;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.facebook.common.logging.FLog;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.mapbox.mapboxsdk.MapboxAccountManager;
import com.mapbox.mapboxsdk.constants.MyLocationTracking;
import com.mapbox.mapboxsdk.constants.MyBearingTracking;
import com.mapbox.mapboxsdk.constants.Style;
import com.mapbox.mapboxsdk.telemetry.MapboxEventManager;

import javax.annotation.Nullable;

public class ReactNativeMapboxGLModule extends ReactContextBaseJavaModule {

    private static final String TAG = ReactNativeMapboxGLModule.class.getSimpleName();

    private ReactApplicationContext context;
    private ReactNativeMapboxGLPackage aPackage;
    private static boolean initialized = false;

    public ReactNativeMapboxGLModule(ReactApplicationContext reactContext, ReactNativeMapboxGLPackage thePackage) {
        super(reactContext);
        this.context = reactContext;
        this.aPackage = thePackage;
        Log.d(TAG, "Context " + context);
        Log.d(TAG, "reactContext " + reactContext);
    }

    @Override
    public String getName() {
        return "MapboxGLManager";
    }

    static private ArrayList<Integer> serializeTracking(int locationTracking, int bearingTracking) {
        ArrayList<Integer> result = new ArrayList<Integer>();
        result.add(locationTracking);
        result.add(bearingTracking);
        return result;
    }

    public static final int[] locationTrackingModes = new int[] {
            MyLocationTracking.TRACKING_NONE,
            MyLocationTracking.TRACKING_FOLLOW,
            MyLocationTracking.TRACKING_FOLLOW,
            MyLocationTracking.TRACKING_FOLLOW
    };

    public static final int[] bearingTrackingModes = new int[] {
            MyBearingTracking.NONE,
            MyBearingTracking.NONE,
            MyBearingTracking.GPS,
            MyBearingTracking.COMPASS
    };

    @Override
    public @Nullable Map<String, Object> getConstants() {
        HashMap<String, Object> constants = new HashMap<String, Object>();

        HashMap<String, Object> userTrackingMode = new HashMap<String, Object>();
        HashMap<String, Object> mapStyles = new HashMap<String, Object>();
        HashMap<String, Object> userLocationVerticalAlignment = new HashMap<String, Object>();

        // User tracking constants
        userTrackingMode.put("none", 0);
        userTrackingMode.put("follow", 1);
        userTrackingMode.put("followWithCourse", 2);
        userTrackingMode.put("followWithHeading", 3);

        // Style constants
        mapStyles.put("light", Style.LIGHT);
        mapStyles.put("dark", Style.DARK);
        mapStyles.put("streets", Style.MAPBOX_STREETS);
        mapStyles.put("emerald", Style.EMERALD);
        mapStyles.put("satellite", Style.SATELLITE);
        mapStyles.put("hybrid", Style.SATELLITE_STREETS);

        // These need to be here for compatibility, even if they're not supported on Android
        userLocationVerticalAlignment.put("center", 0);
        userLocationVerticalAlignment.put("top", 1);
        userLocationVerticalAlignment.put("bottom", 2);

        // Other constants
        constants.put("unknownResourceCount", Long.MAX_VALUE);
        constants.put("metricsEnabled", MapboxEventManager.getMapboxEventManager().isTelemetryEnabled());

        constants.put("userTrackingMode", userTrackingMode);
        constants.put("mapStyles", mapStyles);
        constants.put("userLocationVerticalAlignment", userLocationVerticalAlignment);

        return constants;
    }

    // Access Token

    @ReactMethod
    public void setAccessToken(String accessToken) {
        if (accessToken == null || accessToken.length() == 0 || accessToken.equals("your-mapbox.com-access-token")) {
            throw new JSApplicationIllegalArgumentException("Invalid access token. Register to mapbox.com and request an access token, then pass it to setAccessToken()");
        }
        if (initialized) {
            String oldToken = MapboxAccountManager.getInstance().getAccessToken();
            if (!oldToken.equals(accessToken)) {
                throw new JSApplicationIllegalArgumentException("Mapbox access token cannot be initialized twice with different values");
            }
        }
        initialized = true;
        MapboxAccountManager.start(context, accessToken);
    }

    // Metrics

    @ReactMethod
    public void setMetricsEnabled(boolean value) {
        MapboxEventManager.getMapboxEventManager().setTelemetryEnabled(value);
    }

    // Offline packs

    @ReactMethod
    public void getOfflinePacks(Promise promise) {
        WritableArray result = Arguments.createArray();
        promise.resolve(result);
    }

    @ReactMethod
    public void addOfflinePack(ReadableMap options, Promise promise) {
        promise.reject(new JSApplicationIllegalArgumentException("Mapbox.addOfflinePackForRegion not implemented on Android yet"));
    }

    @ReactMethod
    public void removeOfflinePack(String packName, Promise promise) {
        promise.reject(new JSApplicationIllegalArgumentException("Mapbox.removeOfflinePack not implemented on Android yet"));
    }
}