package com.mapbox.reactnativemapboxgl;

import com.mapbox.mapboxsdk.annotations.BaseMarkerViewOptions;
import com.mapbox.mapboxsdk.annotations.MarkerView;

public class RNMGLCustomMarkerView extends MarkerView {

    private String annotationId;

    public RNMGLCustomMarkerView(BaseMarkerViewOptions baseMarkerViewOptions, String annotationId) {
        super(baseMarkerViewOptions);
        this.annotationId = annotationId;
    }

    public String getAnnotationId() {
        return annotationId;
    }
}
