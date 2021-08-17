package com.mapbox.rctmgl.utils;

import com.facebook.react.bridge.ReadableArray;

import com.mapbox.maps.extension.style.expressions.generated.Expression;

import javax.annotation.Nullable;

public class ExpressionParser {
  static final String TYPE_STRING = "string";
  static final String TYPE_ARRAY = "array";
  static final String TYPE_NUMBER = "number";
  static final String TYPE_MAP = "hashmap";
  static final String TYPE_BOOL = "boolean";

  public static @Nullable Expression from(@Nullable  ReadableArray rawExpressions) {
    return null; // V10TODO
  }
}