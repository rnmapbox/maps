
package com.mapbox.reactnativemapboxgl;

import android.content.Context;
import android.util.Log;
import java.util.HashMap;
import java.util.Map;

import com.facebook.react.bridge.Arguments;
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

import javax.annotation.Nullable;

public class ReactNativeMapboxGLModule extends ReactContextBaseJavaModule {

    private static final String TAG = ReactNativeMapboxGLModule.class.getSimpleName();

    private Context context;
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

    static private WritableArray serializeTracking(int locationTracking, int bearingTracking) {
        WritableArray result = Arguments.createArray();
        result.pushInt(locationTracking);
        result.pushInt(bearingTracking);
        return result;
    }

    @Override
    public @Nullable Map<String, Object> getConstants() {
        HashMap<String, Object> constants = new HashMap<String, Object>();

        HashMap<String, Object> userTrackingMode = new HashMap<String, Object>();
        HashMap<String, Object> mapStyles = new HashMap<String, Object>();

//        // User tracking constants
//        userTrackingMode.put("none", serializeTracking(MyLocationTracking.TRACKING_NONE, MyBearingTracking.NONE));
//        userTrackingMode.put("follow", serializeTracking(MyLocationTracking.TRACKING_FOLLOW, MyBearingTracking.NONE));
//        userTrackingMode.put("followWithCourse", serializeTracking(MyLocationTracking.TRACKING_FOLLOW, MyBearingTracking.GPS));
//        userTrackingMode.put("followWithHeading", serializeTracking(MyLocationTracking.TRACKING_FOLLOW, MyBearingTracking.COMPASS));

        // Style constants
        mapStyles.put("light", Style.LIGHT);
        mapStyles.put("dark", Style.DARK);
        mapStyles.put("streets", Style.MAPBOX_STREETS);
        mapStyles.put("emerald", Style.EMERALD);
        mapStyles.put("satellite", Style.SATELLITE);
        mapStyles.put("hybrid", Style.SATELLITE_STREETS);

        constants.put("userTrackingMode", userTrackingMode);
        constants.put("mapStyles", mapStyles);

        return constants;
    }

    @ReactMethod
    public void setAccessToken(String accessToken) {
        if (accessToken == null || accessToken.length() == 0 || accessToken == "your-mapbox.com-access-token") {
            Log.e(TAG, "Invalid access token. Register to mapbox.com and request an access token, then pass it to setAccessToken()");
            return;
        }
        if (initialized) {
            if (MapboxAccountManager.getInstance().getAccessToken() != accessToken) {
                Log.e(TAG, "Access token cannot be initialized twice with different values");
            }
            return;
        }
        initialized = true;
        MapboxAccountManager.start(context, accessToken);
    }

    @ReactMethod
    public void spliceAnnotations(int mapRef, boolean removeAll, ReadableArray itemsToRemove, ReadableArray itemsToAdd) {
        // TODO
    }

    /*
    @ReactMethod
    public void setDirectionAnimated(int mapRef, int direction) {
        aPackage.getManager().setDirection(aPackage.getManager().getMapView(), direction);
    }

    @ReactMethod
    public void setCenterCoordinateAnimated(int mapRef, double latitude, double longitude) {
        WritableMap location = Arguments.createMap();
        location.putDouble("latitude", latitude);
        location.putDouble("longitude", longitude);
        aPackage.getManager().setCenterCoordinate(aPackage.getManager().getMapView(), location);
    }

    @ReactMethod
    public void setCenterCoordinateZoomLevelAnimated(int mapRef, double latitude, double longitude, double zoom) {
        WritableMap location = Arguments.createMap();
        location.putDouble("latitude", latitude);
        location.putDouble("longitude", longitude);
        location.putDouble("zoom", zoom);
        aPackage.getManager().setCenterCoordinateZoomLevel(aPackage.getManager().getMapView(), location);
    }

    @ReactMethod
    public void addAnnotations(int mapRef, ReadableArray value) {
        aPackage.getManager().setAnnotations(aPackage.getManager().getMapView(), value, false);
    }

    @ReactMethod
    public void setUserTrackingMode(int mapRef, int mode) {
        aPackage.getManager().setMyLocationTrackingMode(aPackage.getManager().getMapView(), mode);
    }

    @ReactMethod
    public void removeAllAnnotations(int mapRef) {
        aPackage.getManager().removeAllAnnotations(aPackage.getManager().getMapView(), true);
    }

    @ReactMethod
    public void setTilt(int mapRef, double pitch) {
        aPackage.getManager().setTilt(aPackage.getManager().getMapView(), pitch);
    }

    @ReactMethod
    public void setVisibleCoordinateBoundsAnimated(int mapRef, double latSW, double lngSW,double latNE, double lngNE, float paddingTop, float paddingRight, float paddingBottom, float paddingLeft) {
        WritableMap info = Arguments.createMap();
        info.putDouble("latSW", latSW);
        info.putDouble("lngSW", lngSW);
        info.putDouble("latNE", latNE);
        info.putDouble("lngNE", lngNE);
        info.putDouble("paddingTop", paddingTop);
        info.putDouble("paddingRight", paddingRight);
        info.putDouble("paddingBottom", paddingBottom);
        info.putDouble("paddingLeft", paddingLeft);
        aPackage.getManager().setVisibleCoordinateBounds(aPackage.getManager().getMapView(), info);
    }

    @ReactMethod
    public void getDirection(int mapRef, Callback successCallback) {
        WritableMap direction = aPackage.getManager().getDirection(aPackage.getManager().getMapView());
        successCallback.invoke(direction);
    }

    @ReactMethod
    public void getCenterCoordinateZoomLevel(int mapRef, Callback successCallback) {
        WritableMap location =aPackage.getManager().getCenterCoordinateZoomLevel(aPackage.getManager().getMapView());
        successCallback.invoke(location);
    }

    @ReactMethod
    public void getBounds(int mapRef, Callback successCallback) {
      WritableMap bounds = aPackage.getManager().getBounds(aPackage.getManager().getMapView());
      successCallback.invoke(bounds);
    }

    */
}