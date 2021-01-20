package com.mapbox.rctmgl.utils;

import android.graphics.PointF;
import android.graphics.RectF;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.NoSuchKeyException;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

import java.text.NumberFormat;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class ConvertUtils {
    public static final String LOG_TAG = "ConvertUtils";

    public static JsonObject toJsonObject(ReadableMap map) {
        if (map == null) return null;
        JsonObject result = new JsonObject();
        ReadableMapKeySetIterator it = map.keySetIterator();

        while (it.hasNextKey()) {
            String key = it.nextKey();
            switch (map.getType(key)) {
                case Map:
                    result.add(key, toJsonObject(map.getMap(key)));
                    break;
                case Array:
                    result.add(key, toJsonArray(map.getArray(key)));
                    break;
                case Null:
                    result.add(key, null);
                    break;
                case Number:
                    result.addProperty(key, map.getDouble(key));
                    break;
                case String:
                    result.addProperty(key, map.getString(key));
                    break;
                case Boolean:
                    result.addProperty(key, map.getBoolean(key));
                    break;
            }
        }
        return result;
    }

    public static JsonArray toJsonArray(ReadableArray array) {
        if (array == null) return null;
        JsonArray result = new JsonArray(array.size());
        for (int i = 0; i < array.size(); i++) {
            switch (array.getType(i)) {
                case Map:
                    result.add(toJsonObject(array.getMap(i)));
                    break;
                case Array:
                    result.add(toJsonArray(array.getArray(i)));
                    break;
                case Null:
                    result.add((JsonElement)null);
                    break;
                case Number:
                    result.add(array.getDouble(i));
                    break;
                case String:
                    result.add(array.getString(i));
                    break;
                case Boolean:
                    result.add(array.getBoolean(i));
                    break;
            }
        }
        return result;
    }

    public static JsonElement typedToJsonElement(ReadableMap map) {
        if (map == null) return null;

        String type = map.getString("type");

        if (type.equals(ExpressionParser.TYPE_MAP)) {
            JsonObject result = new JsonObject();

            ReadableArray keyValues = map.getArray("value");
            for (int i = 0; i < keyValues.size(); i++) {
                ReadableArray keyValue = keyValues.getArray(i);
                String key = keyValue.getMap(0).getString("value");

                result.add(key, typedToJsonElement(keyValue.getMap(1)));
            }
            return result;
        }
        else if (type.equals(ExpressionParser.TYPE_ARRAY)) {
            ReadableArray arrayValue = map.getArray("value");
            JsonArray result = new JsonArray(arrayValue.size());
            for (int i = 0; i < arrayValue.size(); i++) {
                result.add(typedToJsonElement(arrayValue.getMap(i)));
            }
            return result;
        }
        else if (type.equals(ExpressionParser.TYPE_BOOL)) {
            return new JsonPrimitive(map.getBoolean("value"));
        }
        else if (type.equals(ExpressionParser.TYPE_NUMBER)) {
            return new JsonPrimitive(map.getDouble("value"));
        }
        else if (type.equals(ExpressionParser.TYPE_STRING)) {
            return new JsonPrimitive(map.getString("value"));
        }
        else {
            throw new RuntimeException(String.format("Unrecognized type {}", map.getString("type")));
        }
    }

    public static WritableArray toWritableArray(JsonArray array) {
        WritableArray writableArray = Arguments.createArray();

        for (int i = 0; i < array.size(); i++) {
            JsonElement element = array.get(i);

            if (element.isJsonArray()) {
                writableArray.pushArray(toWritableArray(element.getAsJsonArray()));
            } else if (element.isJsonObject()) {
                writableArray.pushMap(toWritableMap(element.getAsJsonObject()));
            } else if (element.isJsonPrimitive()) {
                JsonPrimitive primitive = element.getAsJsonPrimitive();

                if (primitive.isBoolean()) {
                    writableArray.pushBoolean(primitive.getAsBoolean());
                } else if (primitive.isNumber()) {
                    writableArray.pushDouble(primitive.getAsDouble());
                } else {
                    writableArray.pushString(primitive.getAsString());
                }
            }
        }

        return writableArray;
    }

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
                map.putArray(propName, toWritableArray(jsonElement.getAsJsonArray()));
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
            Log.d(LOG_TAG, String.format("No key found for %s, using default value %f", key, defaultValue));
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
