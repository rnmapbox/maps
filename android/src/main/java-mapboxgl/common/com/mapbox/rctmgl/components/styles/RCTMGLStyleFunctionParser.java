package com.mapbox.rctmgl.components.styles;

import android.util.Log;

import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.DynamicFromMap;
import com.facebook.react.bridge.NoSuchKeyException;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableNativeArray;
import com.facebook.react.bridge.ReadableType;
import com.mapbox.mapboxsdk.style.expressions.Expression.Stop;
import com.mapbox.mapboxsdk.style.layers.PropertyValue;

import java.text.NumberFormat;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by nickitaliano on 9/12/17.
 */

public abstract class RCTMGLStyleFunctionParser<T, V> {
    private RCTMGLStyleValue mStyleValue;

    public RCTMGLStyleFunctionParser(RCTMGLStyleValue styleValue) {
        mStyleValue = styleValue;
    }

    public List<StopConfig> getRawStops() {
        ReadableArray readableArrayRawStops = mStyleValue.getArray("stops");

        List<StopConfig> rawStops = new ArrayList<>();

        for (int i = 0; i < readableArrayRawStops.size(); i++) {
            ReadableArray rawStop = readableArrayRawStops.getArray(i);

            ReadableMap jsStopKey = rawStop.getMap(0);
            ReadableMap jsStopValue = rawStop.getMap(1);
            RCTMGLStyleValue innerStyleValue = new RCTMGLStyleValue(jsStopValue);

            Object propertyValue = null;
            try {
                Dynamic dynamicPropertyValue = innerStyleValue.getDynamic("propertyValue");
                ReadableType type = dynamicPropertyValue.getType();

                if (type.equals(ReadableType.Number)) {
                    propertyValue = dynamicPropertyValue.asDouble();
                } else if (type.equals(ReadableType.Boolean)){
                    propertyValue = dynamicPropertyValue.asBoolean();
                } else {
                    propertyValue = dynamicPropertyValue.asString();
                }
            } catch (NoSuchKeyException e) {
                // not a zoom-property value
            }

            StopConfig config;
            if (propertyValue != null) {
                config = new StopConfig(getStopKey(jsStopKey), getRawStopValue(innerStyleValue), propertyValue);
            } else {
                config = new StopConfig(getStopKey(jsStopKey), getRawStopValue(innerStyleValue));
            }

            rawStops.add(config);
        }

        return rawStops;
    }

    protected abstract T getRawStopValue (RCTMGLStyleValue styleValue);
    protected abstract PropertyValue<V> getStopValue(T value);

    private Object getStopKey(ReadableMap jsStopKey) {
        String payloadKey = "value";
        String type = jsStopKey.getString("type");

        switch (type) {
            case "number":
                return jsStopKey.getDouble(payloadKey);
            case "boolean":
                return jsStopKey.getBoolean(payloadKey);
            default:
                return jsStopKey.getString(payloadKey);
        }
    }

    private class StopConfig {
        Object propertyValue;
        T value;
        Object key;

        StopConfig(Object key, T value) {
            this(key, value, null);
        }

        StopConfig(Object key, T value, Object propertyValue) {
            this.key = key;
            this.value = value;
            this.propertyValue = propertyValue;
        }
    }
}
