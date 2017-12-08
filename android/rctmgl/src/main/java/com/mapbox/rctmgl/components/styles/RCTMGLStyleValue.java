package com.mapbox.rctmgl.components.styles;

import android.support.annotation.NonNull;

import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.mapbox.mapboxsdk.style.functions.CameraFunction;
import com.mapbox.mapboxsdk.style.functions.CompositeFunction;
import com.mapbox.mapboxsdk.style.functions.Function;
import com.mapbox.mapboxsdk.style.functions.SourceFunction;
import com.mapbox.mapboxsdk.style.functions.stops.Stop;
import com.mapbox.mapboxsdk.style.functions.stops.Stops;
import com.mapbox.mapboxsdk.style.layers.TransitionOptions;

/**
 * Created by nickitaliano on 9/12/17.
 */

public class RCTMGLStyleValue {

    private String mType;
    private ReadableMap mPayload;

    public static final String FunctionTypeCamera = "camera";
    public static final String FunctionTypeSource = "source";
    public static final String FunctionTypeComposite = "composite";

    public static final int InterpolationModeExponential = 100;
    public static final int InterpolationModeInterval = 101;
    public static final int InterpolationModeCategorical = 102;
    public static final int InterpolationModeIdentity = 103;

    public RCTMGLStyleValue(@NonNull ReadableMap config) {
        mType = config.getString("styletype");
        mPayload = config.getMap("payload");
    }

    public String getType() {
        return mType;
    }

    public boolean isFunction() {
        return mType.equals("function");
    }

    public int getInt(String key) {
        return mPayload.getInt(key);
    }

    public String getString(String key) {
        return mPayload.getString(key);
    }

    public Double getDouble(String key) {
        return mPayload.getDouble(key);
    }

    public Float getFloat(String key) {
        return getDouble(key).floatValue();
    }

    public Dynamic getDynamic(String key) {
        return mPayload.getDynamic(key);
    }

    public ReadableArray getArray(String key) {
        return mPayload.getArray(key);
    }

    public Boolean getBoolean(String key) {
        return mPayload.getBoolean(key);
    }

    public Float[] getFloatArray(String key) {
        ReadableArray arr = getArray(key);

        Float[] floatArr = new Float[arr.size()];
        for (int i = 0; i < arr.size(); i++) {
            floatArr[i] = (float) arr.getDouble(i);
        }

        return floatArr;
    }

    public String[] getStringArray(String key) {
        ReadableArray arr = getArray(key);

        String[] stringArr = new String[arr.size()];
        for (int i = 0; i < arr.size(); i++) {
            stringArr[i] = arr.getString(i);
        }

        return stringArr;
    }

    public ReadableMap getMap(String key) {
        return mPayload.getMap(key);
    }

    public Function makeStyleFunction(RCTMGLStyleFunctionParser functionParser) {
        String fnType = getString("fn");
        int mode = getInt("mode");

        switch (fnType) {
            case FunctionTypeCamera:
                return makeCameraFunction(mode, functionParser);
            case FunctionTypeSource:
                return makeSourceFunction(mode, getString("attributeName"), functionParser);
            case FunctionTypeComposite:
                return makeCompositeFunction(mode, getString("attributeName"), functionParser);
            default:
                return null;
        }
    }

    public CameraFunction makeCameraFunction(int mode, RCTMGLStyleFunctionParser functionParser) {
        Stop[] stops = functionParser.getStops(functionParser.getRawStops());

        switch (mode) {
            case InterpolationModeExponential:
                return Function.zoom(Stops.exponential(stops));
            case InterpolationModeInterval:
                return Function.zoom(Stops.interval(stops));
            default:
                return null;
        }
    }

    public SourceFunction makeSourceFunction(int mode, String property, RCTMGLStyleFunctionParser functionParser) {
        Stop[] stops = functionParser.getStops(functionParser.getRawStops());

        switch (mode) {
            case InterpolationModeExponential:
                return Function.property(property, Stops.exponential(stops));
            case InterpolationModeInterval:
                return Function.property(property, Stops.interval(stops));
            case InterpolationModeCategorical:
                return Function.property(property, Stops.categorical(stops));
            case InterpolationModeIdentity:
                return Function.property(property, Stops.identity());
            default:
                return null;
        }
    }

    public CompositeFunction makeCompositeFunction(int mode, String property, RCTMGLStyleFunctionParser functionParser) {
        Stop[] stops = functionParser.getStops(functionParser.getRawStops());

        switch (mode) {
            case InterpolationModeExponential:
                return Function.composite(property, Stops.exponential(stops));
            case InterpolationModeInterval:
                return Function.composite(property, Stops.interval(stops));
            case InterpolationModeCategorical:
                return Function.composite(property, Stops.categorical(stops));
            default:
                return null;
        }
    }

    public TransitionOptions getTransition() {
        if (!mType.equals("transition")) {
            return null;
        }
        ReadableMap config = getMap(RCTMGLStyleFactory.VALUE_KEY);
        return TransitionOptions.fromTransitionOptions(config.getInt("duration"), config.getInt("delay"));
    }
}
