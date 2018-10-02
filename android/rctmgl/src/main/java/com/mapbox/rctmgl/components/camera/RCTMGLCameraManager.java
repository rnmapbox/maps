package com.mapbox.rctmgl.components.camera;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.rctmgl.components.AbstractEventEmitter;

import java.util.HashMap;
import java.util.Map;

public class RCTMGLCameraManager extends AbstractEventEmitter<RCTMGLCamera> {
    public static final String REACT_CLASS = RCTMGLCamera.class.getSimpleName();

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
        CameraStop stop = CameraStop.fromReadableMap(mContext, map, null);
        camera.setStop(stop);
    }
}
