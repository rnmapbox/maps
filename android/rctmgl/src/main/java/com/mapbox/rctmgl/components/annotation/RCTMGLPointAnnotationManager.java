package com.mapbox.rctmgl.components.annotation;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.rctmgl.components.AbstractEventEmitter;
import com.mapbox.rctmgl.events.constants.EventKeys;
import com.mapbox.rctmgl.utils.GeoJSONUtils;

import java.util.Map;

/**
 * Created by nickitaliano on 9/27/17.
 */

public class RCTMGLPointAnnotationManager extends AbstractEventEmitter<RCTMGLPointAnnotation> {
    public static final String REACT_CLASS = "RCTMGLPointAnnotation";

    public RCTMGLPointAnnotationManager(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
    }

    @Override
    public Map<String, String> customEvents() {
        return MapBuilder.<String, String>builder()
                .put(EventKeys.POINT_ANNOTATION_SELECTED, "onMapboxPointAnnotationSelected")
                .put(EventKeys.POINT_ANNOTATION_DESELECTED, "onMapboxPointAnnotationDeselected")
                .put(EventKeys.POINT_ANNOTATION_DRAG_START, "onMapboxPointAnnotationDragStart")
                .put(EventKeys.POINT_ANNOTATION_DRAG_END, "onMapboxPointAnnotationDragEnd")
                .build();
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLPointAnnotation createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLPointAnnotation(reactContext, this);
    }

    @ReactProp(name="id")
    public void setId(RCTMGLPointAnnotation annotation, String id) {
        annotation.setID(id);
    }

    @ReactProp(name="coordinate")
    public void setCoordinate(RCTMGLPointAnnotation annotation, String geoJSONStr) {
        annotation.setCoordinate(GeoJSONUtils.toPointGeometry(geoJSONStr));
    }

    @ReactProp(name="anchor")
    public void setAnchor(RCTMGLPointAnnotation annotation, ReadableMap map) {
        annotation.setAnchor((float) map.getDouble("x"), (float) map.getDouble("y"));
    }

    @ReactProp(name="draggable")
    public void setDraggable(RCTMGLPointAnnotation annotation, Boolean draggable) {
        annotation.setDraggable(draggable);
    }
}
