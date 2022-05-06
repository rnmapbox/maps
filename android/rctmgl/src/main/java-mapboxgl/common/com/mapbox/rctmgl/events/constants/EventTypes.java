package com.mapbox.rctmgl.events.constants;

/**
 * Created by nickitaliano on 8/24/17.
 */

public class EventTypes {
    // map event types
    public static final String MAP_CLICK = "press";
    public static final String MAP_LONG_CLICK = "longpress";
    public static final String MAP_USER_TRACKING_MODE_CHANGE = "usertrackingmodechange";

    public static final String REGION_WILL_CHANGE = "regionwillchange";
    public static final String REGION_IS_CHANGING = "regionischanging";
    public static final String REGION_DID_CHANGE  = "regiondidchange";
    public static final String USER_LOCATION_UPDATED = "userlocationdupdated";

    public static final String WILL_START_LOADING_MAP = "willstartloadingmap";
    public static final String DID_FINISH_LOADING_MAP = "didfinishloadingmap";
    public static final String DID_FAIL_LOADING_MAP = "didfailloadingmap";

    public static final String WILL_START_RENDERING_FRAME = "willstartrenderingframe";
    public static final String DID_FINISH_RENDERING_FRAME = "didfinishrenderingframe";
    public static final String DID_FINISH_RENDERING_FRAME_FULLY = "didfinishrenderingframefully";

    public static final String WILL_START_RENDERING_MAP = "willstartrenderingmap";
    public static final String DID_FINISH_RENDERING_MAP = "didfinishrenderingmap";
    public static final String DID_FINISH_RENDERING_MAP_FULLY = "didfinishrenderingmapfully";

    public static final String DID_FINISH_LOADING_STYLE = "didfinishloadingstyle";

    // point annotation event types
    public static final String ANNOTATION_SELECTED = "annotationselected";
    public static final String ANNOTATION_DESELECTED = "annotationdeselected";
    public static final String ANNOTATION_DRAG_START = "annotationdragstart";
    public static final String ANNOTATION_DRAG = "annotationdrag";
    public static final String ANNOTATION_DRAG_END = "annotationdragend";

    // offline event types
    public static final String OFFLINE_ERROR = "offlineerror";
    public static final String OFFLINE_TILE_LIMIT = "offlinetilelimit";
    public static final String OFFLINE_STATUS = "offlinestatus";

    // shape source event types
    public static final String SHAPE_SOURCE_LAYER_CLICK = "shapesourcelayerpress";
    public static final String VECTOR_SOURCE_LAYER_CLICK = "vectorsourcelayerpress";
    public static final String RASTER_SOURCE_LAYER_CLICK = "rastersourcelayerpress";

    // image missing event type
    public static final String IMAGES_MISSING = "imagesmissing";
}
