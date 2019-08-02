package com.mapbox.rctmgl.components.camera;

import com.facebook.common.logging.FLog;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.rctmgl.components.AbstractEventEmitter;

import java.util.HashMap;
import java.util.Map;

public class RCTMGLCameraManager extends AbstractEventEmitter<RCTMGLCamera> {
    public static final String REACT_CLASS = "RCTMGLCamera";

    private ReactApplicationContext mContext;

    public RCTMGLCameraManager(ReactApplicationContext context) {
        super(context);
        mContext = context;
    }

    @Override
    public Map<String, String> customEvents() {
        return new HashMap<>();
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLCamera createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLCamera(reactContext, this);
    }

    @ReactProp(name="stop")
    public void setStop(RCTMGLCamera camera, ReadableMap map) {
        if (map != null) {
            CameraStop stop = CameraStop.fromReadableMap(mContext, map, null);
            camera.setStop(stop);
        }
    }

    @ReactProp(name="defaultStop")
    public void setDefaultStop(RCTMGLCamera camera, ReadableMap map) {
        if (map != null) {
            CameraStop stop = CameraStop.fromReadableMap(mContext, map, null);
            camera.setDefaultStop(stop);
        }
    }

    @ReactProp(name="userTrackingMode")
    public void setUserTrackingMode(RCTMGLCamera camera, int userTrackingMode) {
        camera.setUserTrackingMode(userTrackingMode);
    }

    @ReactProp(name="followZoomLevel")
    public void setZoomLevel(RCTMGLCamera camera, double zoomLevel) {
        camera.setZoomLevel(zoomLevel);
    }

    @ReactProp(name="followUserLocation")
    public void setFollowUserLocation(RCTMGLCamera camera, boolean value) {
        camera.setFollowUserLocation(value);
    }

    @ReactProp(name="followUserMode")
    public void setFollowUserMode(RCTMGLCamera camera, String value) {
        camera.setFollowUserMode(value);
    }

    @ReactProp(name="minZoomLevel")
    public void setMinZoomLevel(RCTMGLCamera camera, double value) {
        camera.setMinZoomLevel(value);
    }

    @ReactProp(name="maxZoomLevel")
    public void setMaxZoomLevel(RCTMGLCamera camera, double value) {
        camera.setMaxZoomLevel(value);
    }

}
