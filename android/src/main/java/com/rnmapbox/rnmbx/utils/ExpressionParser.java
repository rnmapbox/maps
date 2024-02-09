package com.rnmapbox.rnmbx.utils;

import com.facebook.react.bridge.ReadableArray;

import com.facebook.react.bridge.ReadableMap;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.mapbox.maps.extension.style.expressions.generated.Expression;
import com.rnmapbox.rnmbx.utils.Logger;

import java.util.Locale;

import javax.annotation.Nullable;

public class ExpressionParser {
  static final String LOG_TAG = "RNMBXMapView";
  static final String TYPE_STRING = "string";
  static final String TYPE_ARRAY = "array";
  static final String TYPE_NUMBER = "number";
  static final String TYPE_MAP = "hashmap";
  static final String TYPE_BOOL = "boolean";

  public static @Nullable Expression from(@Nullable  ReadableArray rawExpressions) {
    if (rawExpressions == null || rawExpressions.size() == 0) {
      return null;
    }
    try {
      JsonArray array = ConvertUtils.toJsonArray(rawExpressions);
      String jsonString = new Gson().toJson(array);
      return Expression.fromRaw(jsonString);
    } catch (Exception e) {
      Logger.e(LOG_TAG, "An error occurred while attempting to parse the expression", e);
      return null;
    }
  }

  public static @Nullable Expression fromTyped(ReadableMap rawExpressions) {
    JsonArray array = (JsonArray)ConvertUtils.typedToJsonElement(rawExpressions);
    String jsonString = new Gson().toJson(array);
    return Expression.fromRaw(jsonString);
  }

  public static Expression from(ReadableMap rawExpression) {
    return Expression.fromRaw("[" + stringExpression(rawExpression) + "]");
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