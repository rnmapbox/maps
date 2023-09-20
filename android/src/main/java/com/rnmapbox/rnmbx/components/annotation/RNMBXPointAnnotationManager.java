package com.rnmapbox.rnmbx.components.annotation;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.rnmapbox.rnmbx.components.AbstractEventEmitter;
import com.rnmapbox.rnmbx.events.constants.EventKeys;
import com.rnmapbox.rnmbx.utils.GeoJSONUtils;

import java.util.Map;

public class RNMBXPointAnnotationManager extends AbstractEventEmitter<RNMBXPointAnnotation> {
    public static final String REACT_CLASS = "RNMBXPointAnnotation";

    public RNMBXPointAnnotationManager(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
    }

    @Override
    public Map<String, String> customEvents() {
        return MapBuilder.<String, String>builder()
                .put(EventKeys.POINT_ANNOTATION_SELECTED, "onMapboxPointAnnotationSelected")
                .put(EventKeys.POINT_ANNOTATION_DESELECTED, "onMapboxPointAnnotationDeselected")
                .put(EventKeys.POINT_ANNOTATION_DRAG_START, "onMapboxPointAnnotationDragStart")
                .put(EventKeys.POINT_ANNOTATION_DRAG, "onMapboxPointAnnotationDrag")
                .put(EventKeys.POINT_ANNOTATION_DRAG_END, "onMapboxPointAnnotationDragEnd")
                .build();
    }

    //region React Methods
    public static final int METHOD_REFRESH = 2;

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.<String, Integer>builder()
                .put("refresh", METHOD_REFRESH)
                .build();
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RNMBXPointAnnotation createViewInstance(ThemedReactContext reactContext) {
        return new RNMBXPointAnnotation(reactContext, this);
    }

    @ReactProp(name="id")
    public void setId(RNMBXPointAnnotation annotation, String id) {
        annotation.setID(id);
    }

    @ReactProp(name="coordinate")
    public void setCoordinate(RNMBXPointAnnotation annotation, String geoJSONStr) {
        annotation.setCoordinate(GeoJSONUtils.toPointGeometry(geoJSONStr));
    }

    @ReactProp(name="anchor")
    public void setAnchor(RNMBXPointAnnotation annotation, ReadableMap map) {
        annotation.setAnchor((float) map.getDouble("x"), (float) map.getDouble("y"));
    }

    @ReactProp(name="draggable")
    public void setDraggable(RNMBXPointAnnotation annotation, Boolean draggable) {
        annotation.setDraggable(draggable);
    }

    @Override
    public void receiveCommand(RNMBXPointAnnotation annotation, int commandID, @Nullable ReadableArray args) {
        switch (commandID) {
            case METHOD_REFRESH:
                annotation.refresh();
                break;
        }
    }
}
