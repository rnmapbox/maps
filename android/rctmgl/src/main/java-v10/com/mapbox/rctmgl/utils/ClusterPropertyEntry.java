package com.mapbox.rctmgl.utils;


import com.mapbox.maps.extension.style.expressions.generated.Expression;

public class ClusterPropertyEntry {
    public Expression operator;
    public Expression mapping;

    public ClusterPropertyEntry(Expression _operator, Expression _mapping) {
        operator = _operator;
        mapping = _mapping;
    }
}