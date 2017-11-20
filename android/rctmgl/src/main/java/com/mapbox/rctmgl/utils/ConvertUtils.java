package com.mapbox.rctmgl.utils;

import android.graphics.PointF;
import android.graphics.RectF;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.NoSuchKeyException;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.LatLngBounds;
import com.mapbox.services.commons.geojson.Feature;
import com.mapbox.services.commons.geojson.FeatureCollection;
import com.mapbox.services.commons.geojson.Point;

import java.text.NumberFormat;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class ConvertUtils {
    public static final String LOG_TAG = ConvertUtils.class.getSimpleName();

    public static WritableMap toWritableMap(JsonObject object) {
        WritableMap map = Arguments.createMap();

        for (Map.Entry<String, JsonElement> entry : object.entrySet()) {
            String propName = entry.getKey();
            JsonElement jsonElement = entry.getValue();

            if (jsonElement.isJsonPrimitive()) {
                JsonPrimitive primitive = jsonElement.getAsJsonPrimitive();

                if (primitive.isBoolean()) {
                    map.putBoolean(propName, primitive.getAsBoolean());
                } else if (primitive.isNumber()) {
                    map.putDouble(propName, primitive.getAsDouble());
                } else {
                    map.putString(propName, primitive.getAsString());
                }
            } else if (jsonElement.isJsonArray()) {
                JsonArray jsonArray = jsonElement.getAsJsonArray();

                Object[] array = new Object[jsonArray.size()];
                for (int i = 0; i < jsonArray.size(); i++) {
                    array[i] = toWritableMap(jsonArray.get(i).getAsJsonObject());
                }

                map.putArray(propName, Arguments.fromArray(array));
            } else if (jsonElement.isJsonObject()) {
                map.putMap(propName, toWritableMap(jsonElement.getAsJsonObject()));
            }
        }

        return map;
    }

    public static Object getObjectFromString(String str) {
        NumberFormat numberFormat = NumberFormat.getNumberInstance();

        try {
            return numberFormat.parse(str);
        } catch (ParseException e) {
            // ignore we're just figuring out what type this is
        }

        return str;
    }

    public static List<String> toStringList(ReadableArray array) {
        List<String> list = new ArrayList<>();

        if (array == null) {
            return list;
        }

        for (int i = 0; i < array.size(); i++) {
            list.add(array.getString(i));
        }

        return list;
    }

    public static PointF toPointF(ReadableArray array) {
        PointF pointF = new PointF();

        if (array == null) {
            return pointF;
        }

        pointF.set((float)array.getDouble(0), (float)array.getDouble(1));
        return pointF;
    }

    public static RectF toRectF(ReadableArray array) {
        RectF rectF = new RectF();

        if (array == null) {
            return rectF;
        }

        rectF.set((float)array.getDouble(3), (float)array.getDouble(0), (float)array.getDouble(1), (float)array.getDouble(2));
        return rectF;
    }

    public static double getDouble(String key, ReadableMap map, double defaultValue) {
        double value = defaultValue;

        try {
            value = map.getDouble(key);
        } catch (NoSuchKeyException e) {
            // key not found use default value
            Log.d(LOG_TAG, String.format("No key found for %s, using default value %d", key, defaultValue));
        }

        return value;
    }

    public static String getString(String key, ReadableMap map, String defaultValue) {
        String value = defaultValue;

        try {
            value = map.getString(key);
        } catch (NoSuchKeyException e) {
            // key not found use default value
            Log.d(LOG_TAG, String.format("No key found for %s, using default value %s", key, defaultValue));
        }

        return value;
    }
}
