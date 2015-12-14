
package com.mapbox.reactnativemapboxgl;

import android.content.Context;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
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

    @ReactMethod
    public void setDirectionAnimated(double mapRef, int direction) {
        aPackage.getManager().setDirection(aPackage.getManager().getMapView(), direction);
    }

    @ReactMethod
    public void setCenterCoordinateAnimated(double mapRef, double latitude, double longitude) {
        WritableMap location = Arguments.createMap();
        location.putDouble("latitude", latitude);
        location.putDouble("longitude", longitude);
        aPackage.getManager().setCenterCoordinate(aPackage.getManager().getMapView(), location);
    }

    @ReactMethod
    public void setCenterCoordinateZoomLevelAnimated(double mapRef, double latitude, double longitude, double zoom) {
        WritableMap location = Arguments.createMap();
        location.putDouble("latitude", latitude);
        location.putDouble("longitude", longitude);
        location.putDouble("zoom", zoom);
        aPackage.getManager().setCenterCoordinate(aPackage.getManager().getMapView(), location);
    }

    @ReactMethod
    public void addAnnotations(double mapRef, ReadableArray value) {
        aPackage.getManager().setAnnotations(aPackage.getManager().getMapView(), value);
    }

    @ReactMethod
    public void setUserTrackingMode(double mapRef, String mode) {
        aPackage.getManager().setMyLocationTrackingMode(aPackage.getManager().getMapView(), mode);
    }

    @ReactMethod
    public void removeAllAnnotations(double mapRef) {
        aPackage.getManager().removeAllAnnotations(aPackage.getManager().getMapView(), true);
    }

    @ReactMethod
    public void setTilt(double mapRef, double pitch) {
        aPackage.getManager().setTilt(aPackage.getManager().getMapView(), pitch);
    }

    @ReactMethod
    public void setVisibleCoordinateBoundsAnimated(double mapRef, double latSW, double lngSW,double latNE, double lngNE, float paddingTop, float paddingRight, float paddingBottom, float paddingLeft) {
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

    public void setPackage(ReactNativeMapboxGLPackage aPackage) {
        this.aPackage = aPackage;
    }
}