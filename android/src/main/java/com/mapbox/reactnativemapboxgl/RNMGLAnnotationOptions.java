package com.mapbox.reactnativemapboxgl;

import com.mapbox.mapboxsdk.annotations.Annotation;
import com.mapbox.mapboxsdk.maps.MapboxMap;

public interface RNMGLAnnotationOptions {
    public abstract Annotation addToMap(MapboxMap map);
}