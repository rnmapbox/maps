
package com.mapbox.reactnativemapboxgl;

import android.content.Context;
import android.util.Log;
import java.util.HashMap;
import java.util.Map;

import com.mapbox.mapboxsdk.constants.Style;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableMap;
import com.mapbox.mapboxsdk.constants.MyLocationTracking;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.views.MapView;

import javax.annotation.Nullable;

public class ReactNativeMapboxGLModule extends ReactContextBaseJavaModule {

    private static final String TAG = ReactNativeMapboxGLModule.class.getSimpleName();

    private Context context;
    private ReactNativeMapboxGLPackage aPackage;

    public ReactNativeMapboxGLModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
        Log.d(TAG, "Context " + context);
        Log.d(TAG, "reactContext " + reactContext);
    }

    @Override
    public String getName() {
        return "MapboxGLManager";
    }

    @Override
    public @Nullable Map<String, Object> getConstants() {
        HashMap<String, Object> constants = new HashMap<String, Object>();

        HashMap<String, Object> userTrackingMode = new HashMap<String, Object>();
        HashMap<String, Object> mapStyles = new HashMap<String, Object>();

        // User tracking constants
        userTrackingMode.put("none", MyLocationTracking.TRACKING_NONE);
        userTrackingMode.put("follow", MyLocationTracking.TRACKING_FOLLOW);

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
        WritableMap location = aPackage.getManager().getCenterCoordinateZoomLevel(aPackage.getManager().getMapView());
        successCallback.invoke(location);
    }

    @ReactMethod
    public void getBounds(int mapRef, Callback successCallback) {
      WritableMap bounds = aPackage.getManager().getBounds(aPackage.getManager().getMapView());
      successCallback.invoke(bounds);
    }

    public void setPackage(ReactNativeMapboxGLPackage aPackage) {
        this.aPackage = aPackage;
    }
}