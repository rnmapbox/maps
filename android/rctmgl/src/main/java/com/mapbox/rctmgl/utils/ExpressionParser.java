package com.mapbox.rctmgl.utils;

import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.google.gson.JsonArray;
import com.mapbox.mapboxsdk.style.expressions.Expression;
import com.mapbox.mapboxsdk.style.expressions.Expression.Converter;

import org.json.JSONArray;

import java.util.Locale;

import javax.annotation.Nullable;

public class ExpressionParser {
    static final String TYPE_STRING = "string";
    static final String TYPE_ARRAY = "array";
    static final String TYPE_NUMBER = "number";
    static final String TYPE_MAP = "hashmap";
    static final String TYPE_BOOL = "boolean";

    public static @Nullable Expression from(@Nullable  ReadableArray rawExpressions) {
        if (rawExpressions == null || rawExpressions.size() == 0) {
            return null;
        }

        return Expression.Converter.convert(ConvertUtils.toJsonArray(rawExpressions));
    }

    public static Expression fromTyped(ReadableMap rawExpressions) {
        JsonArray array = (JsonArray)ConvertUtils.typedToJsonElement(rawExpressions);
        return Expression.Converter.convert(array);
    }



    public static Expression from(ReadableMap rawExpression) {
        return Expression.raw("[" + stringExpression(rawExpression) + "]");
    }

    private static String stringExpression(ReadableMap item) {
        String expression = "";
        String type = item.getString("type");

        if (TYPE_STRING.equals(type)) {
            String value = item.getString("value");
            expression = String.format(Locale.ENGLISH, "\"%s\"", value);
        } else if (TYPE_NUMBER.equals(type)) {
            Double value = item.getDouble("value");
            expression = String.format(Locale.ENGLISH, "%f", value);
        } else if (TYPE_BOOL.equals(type)) {
            Boolean value = item.getBoolean("value");
            expression = String.format(Locale.ENGLISH, "%b", value);
        } else if (TYPE_ARRAY.equals(type)) {
            ReadableArray entries = item.getArray("value");

            expression += "[";

            for (int i = 0; i < entries.size(); i++) {
                String entryExpression = stringExpression(entries.getMap(i));
                expression += entryExpression;

                if (i < entries.size() - 1) {
                    expression += ",";
                }
            }

            expression += "]";
        }

        return expression;
    }
}
