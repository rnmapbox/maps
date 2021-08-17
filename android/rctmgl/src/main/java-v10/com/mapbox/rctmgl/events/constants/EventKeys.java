package com.mapbox.rctmgl.events.constants;

/**
 * Created by nickitaliano on 8/27/17.
 */

public class EventKeys {
    public static final String NAMESPACE = "rct.mapbox";

    // map events
    public static final String MAP_CLICK = ns("map.press");
    public static final String MAP_LONG_CLICK = ns("map.longpress");
    public static final String MAP_ONCHANGE = ns("map.change");
    public static final String MAP_ON_LOCATION_CHANGE = ns("map.location.change");
    public static final String MAP_ANDROID_CALLBACK = ns("map.androidcallback");
    public static final String MAP_USER_TRACKING_MODE_CHANGE = ns("map.usertrackingmodechange");

    // point annotation events
    public static final String POINT_ANNOTATION_SELECTED = ns("pointannotation.selected");
    public static final String POINT_ANNOTATION_DESELECTED = ns("pointannotation.deselected");
    public static final String POINT_ANNOTATION_DRAG_START = ns("pointannotation.dragstart");
    public static final String POINT_ANNOTATION_DRAG = ns("pointannotation.drag");
    public static final String POINT_ANNOTATION_DRAG_END = ns("pointannotation.dragend");

    // source events
    public static final String SHAPE_SOURCE_LAYER_CLICK = ns("shapesource.layer.pressed");
    public static final String VECTOR_SOURCE_LAYER_CLICK = ns("vectorsource.layer.pressed");
    public static final String RASTER_SOURCE_LAYER_CLICK = ns("rastersource.layer.pressed");

    // images event
    public static final String IMAGES_MISSING = ns("images.missing");

    // location events
    public static final String USER_LOCATION_UPDATE = ns("user.location.update");

    private static String ns(String name) {
        return String.format("%s.%s", NAMESPACE, name);
    }
}
