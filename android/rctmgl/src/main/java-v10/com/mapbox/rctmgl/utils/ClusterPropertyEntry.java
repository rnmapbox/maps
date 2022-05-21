package com.mapbox.rctmgl.utils;


import com.facebook.react.bridge.ReadableArray;
import com.mapbox.maps.extension.style.expressions.generated.Expression;

public class ClusterPropertyEntry {
    public Expression operator;
    public Expression mapping;

    public ClusterPropertyEntry(ReadableArray expressions) {
        switch (expressions.getType(0)) {
            case Array:
               operator =  ExpressionParser.from(expressions.getArray(0));
               break;
            case Map:
                operator = ExpressionParser.from(expressions.getMap(0));
                break;
            case Boolean:
                operator = Expression.literal(expressions.getBoolean(0));
                break;
            case Number:
                // All JS numbers are doubles
                operator = Expression.literal(expressions.getDouble(0));
                break;
            default:
                // String, Null
                operator = Expression.literal(expressions.getString(0));
                break;
        }

        switch (expressions.getType(1)) {
            case Array:
                mapping =  ExpressionParser.from(expressions.getArray(1));
                break;
            case Map:
                mapping = ExpressionParser.from(expressions.getMap(1));
                break;
            case Boolean:
                mapping = Expression.literal(expressions.getBoolean(1));
                break;
            case Number:
                // All JS numbers are doubles
                mapping = Expression.literal(expressions.getDouble(1));
                break;
            default:
                // String, Null
                mapping = Expression.literal(expressions.getString(1));
                break;
        }
    }
}
